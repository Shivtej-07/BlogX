import { Client, Storage, Permission, Role } from 'appwrite';

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a3778ca001aa314afb1");

const storage = new Storage(client);
const bucketId = "6a377d90001dcfdae9a3";

async function updatePermissions() {
    try {
        console.log("Fetching files from bucket...");
        const response = await storage.listFiles(bucketId);
        console.log(`Found ${response.files.length} files. Updating permissions...`);

        for (const file of response.files) {
            console.log(`Updating file ${file.$id} (${file.name})...`);
            // We want to keep the existing permissions but also add public read access.
            // In Appwrite, we can specify the new permissions array.
            const currentPermissions = file.$permissions || [];
            
            // Check if read("any") is already present
            const hasPublicRead = currentPermissions.includes('read("any")');
            if (hasPublicRead) {
                console.log(`  File ${file.$id} already has public read access.`);
                continue;
            }

            // Create new permissions array: public read + user permissions (read/update/delete)
            const newPermissions = [
                Permission.read(Role.any()),
                ...currentPermissions
            ];

            try {
                // In Appwrite Storage Web SDK, updateFile signature:
                // updateFile(bucketId, fileId, name, security, permissions) or updateFile(bucketId, fileId, name, permissions)
                // Let's verify what updateFile parameters are.
                // In v12+, it is updateFile(bucketId, fileId, name, permissions) or similar.
                await storage.updateFile(
                    bucketId,
                    file.$id,
                    undefined, // keep existing name (passing undefined or empty string or file.name)
                    newPermissions
                );
                console.log(`  Successfully updated file ${file.$id}`);
            } catch (err) {
                console.error(`  Failed to update file ${file.$id}:`, err.message);
            }
        }
        console.log("Finished updating file permissions.");
    } catch (error) {
        console.error("Error fetching files:", error);
    }
}

updatePermissions();
