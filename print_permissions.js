import { Client, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a3778ca001aa314afb1");

const storage = new Storage(client);
const bucketId = "6a377d90001dcfdae9a3";

async function run() {
    try {
        const file1 = await storage.getFile(bucketId, "6a3dfbb200229253513a");
        console.log("Working file permissions:", file1.$permissions);

        const file2 = await storage.getFile(bucketId, "6a3df580002584c872d0");
        console.log("Failing file permissions:", file2.$permissions);
    } catch (e) {
        console.error(e);
    }
}

run();
