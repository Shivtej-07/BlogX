import { Client, Storage, Permission, Role, ID } from 'appwrite';

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a3778ca001aa314afb1");

const storage = new Storage(client);
const bucketId = "6a377d90001dcfdae9a3";

async function run() {
    try {
        console.log("Uploading file with explicit public read, update, delete permissions...");
        const blob = new Blob(["Hello World"], { type: 'text/plain' });
        const file = new File([blob], "dummy_test.txt");

        const response = await storage.createFile(
            bucketId,
            ID.unique(),
            file,
            [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );
        console.log("Upload succeeded! File ID:", response.$id);
        console.log("File permissions:", response.$permissions);
    } catch (e) {
        console.error("Upload failed:", e.message);
    }
}

run();
