import fs from 'fs';
import path from 'path';

function main() {
    /**
     * This script ensures the plugin artifacts are symlinked into the demo vault.
     * Such that you can test your build in the demo vault.
     */
    const main_js = path.resolve("main.js");
    const srcPaths = ["manifest.json", "styles.css", main_js].map((p) => path.resolve(p));
    const outputFolder = "demo_vault/.obsidian/plugins/copilot-auto-completion";

    if (!fs.existsSync(main_js)) {
        fs.writeFileSync(main_js, '');
    }

    for (const srcPath of srcPaths) {
        const targetPath = path.resolve(outputFolder, path.basename(srcPath));

        if (!fs.existsSync(srcPath)) {
            throw new Error(`File ${srcPath} does not exist. 
            Please make sure the file exists and run this script from the root of the repository.`
            );
        }

        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
        }

        try {
            fs.symlinkSync(srcPath, targetPath);
        } catch (error) {
            throw new Error(`Failed to create symlink from ${srcPath} to ${targetPath}. Error: ${error}`);
        }
    }
}

main();
