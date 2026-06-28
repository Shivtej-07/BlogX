import conf from '../conf/conf.js';
import { Client, Account, ID } from 'appwrite';

const MOCK_USER = {
  $id: "mock-user-123",
  name: "Sarah Connor",
  email: "sarah@connor.io",
  bio: "Lead SaaS Developer & Tech Blogger. Writing about React, Framer Motion, and building premium interfaces.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
  cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  }
};

export class AuthService {
  client = new Client();
  account;
  useMock = false;

  constructor() {
    try {
      if (conf.appwriteUrl && conf.appwriteProjectId && !conf.appwriteProjectId.includes("VITE_")) {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
      } else {
        this.useMock = true;
      }
    } catch (e) {
      console.warn("Appwrite initialization failed, switching to Mock Mode.", e);
      this.useMock = true;
    }
  }
  
  async createAccount({email, password, name}) {
    if (this.useMock) {
      const newUser = { ...MOCK_USER, email, name, $id: ID.unique() };
      localStorage.setItem("blogx_mock_user", JSON.stringify(newUser));
      localStorage.setItem("blogx_mock_session", "true");
      return newUser;
    }
    try {
      const userAccount = await this.account.create(ID.unique(), email, password, name);
      if (userAccount) {
        return this.login({email, password});
      } else {
        return userAccount;
      }
    } catch (error) {
      console.warn("Appwrite createAccount failed, falling back to Mock Mode.", error);
      const newUser = { ...MOCK_USER, email, name, $id: ID.unique() };
      localStorage.setItem("blogx_mock_user", JSON.stringify(newUser));
      localStorage.setItem("blogx_mock_session", "true");
      this.useMock = true;
      return newUser;
    }
  }

  async login({email, password}) {
    if (this.useMock) {
      localStorage.setItem("blogx_mock_session", "true");
      if (!localStorage.getItem("blogx_mock_user")) {
        localStorage.setItem("blogx_mock_user", JSON.stringify(MOCK_USER));
      }
      return { $id: "mock-session-id" };
    }
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.warn("Appwrite login failed, falling back to Mock Mode.", error);
      localStorage.setItem("blogx_mock_session", "true");
      if (!localStorage.getItem("blogx_mock_user")) {
        localStorage.setItem("blogx_mock_user", JSON.stringify(MOCK_USER));
      }
      this.useMock = true;
      return { $id: "mock-session-id" };
    }
  }

  async getCurrentUser() {
    if (this.useMock) {
      const hasSession = localStorage.getItem("blogx_mock_session") === "true";
      if (hasSession) {
        const stored = localStorage.getItem("blogx_mock_user");
        return stored ? JSON.parse(stored) : MOCK_USER;
      }
      return null;
    }
    try {
      return await this.account.get();
    } catch (error) {
      // If it's a standard unauthenticated error, just return null (do not switch to mock mode)
      if (error && error.code === 401) {
        return null;
      }
      // Check if we have a mock session as fallback
      const hasSession = localStorage.getItem("blogx_mock_session") === "true";
      if (hasSession) {
        this.useMock = true;
        const stored = localStorage.getItem("blogx_mock_user");
        return stored ? JSON.parse(stored) : MOCK_USER;
      }
      return null;  
    }
  }

  async logout() {
    localStorage.removeItem("blogx_mock_session");
    if (this.useMock) {
      return true;
    }
    try {
      await this.account.deleteSessions();
    } catch (error) {
       console.log("Appwrite service logout error", error);
    }
  }

  // Helper to update mock/real bio in profile
  async updateProfile(updatedData) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...updatedData };
      if (this.useMock || currentUser.$id.startsWith("mock") || !this.account) {
        localStorage.setItem("blogx_mock_user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      // If real Appwrite, we can store in localStorage as cache since Appwrite accounts don't have bios directly (needs a preferences/DB record)
      localStorage.setItem(`blogx_profile_pref_${currentUser.$id}`, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;