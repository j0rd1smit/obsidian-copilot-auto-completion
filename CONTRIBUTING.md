# CONTRIBUTING.md

## Local Development
To develop the plugin locally, follow these steps:

1. Clone the project into this directory using: `git clone https://github.com/j0rd1smit/obsidian-copilot` (or your fork).
2. Navigate to the newly created `obsidian-copilot` folder using: `cd obsidian-copilot`.
3. Install the dependencies with: `npm install`.
4. Run the build script with: `npm run dev`, which will:
    - Build the plugin and place the files in the `.obsidian/plugins/obsidian-copilot` folder.
    - Watch for file changes and automatically rebuild the plugin when changes are made. (Use the `reload app without saving` action in Obsidian to see the changes).
5. Open the `demo_vault` in your local Obsidian application.
6. Enable `obsidian-copilot` in the community plugins section.
7. Access the `obsidian-copilot` settings and enter the necessary secrets.
8. You are now ready to test the plugin in the `demo_vault`.
9. For more information on the different test cases, refer to the [README.md](demo_vault/README.md) file in the `demo_vault`.

Want to try out in your own vault? You can do so by following these steps:
1. Go to your (development) obsidian vault.
2. Find the dotfiles folder with all the configs. Typically name `.obsidian`
3. Go to the plugin folder here. This is typically named `plugins`. If you have not installed any plugins, this folder might not exist.
4. Copy the folder `demo_vault/.obsidian/plugins/obsidian-copilot` into your own plugins folder.

You can now make changes to the plugin and test them locally.
If your changes could benefit others, feel free to submit a pull request.

## Making a Release
To make a release, follow these steps:
1. Update the version number in the `package.json` file.
2. Execute the following commands to synchronize the version number across all files:
    ```bash
    npm install
    npm run version
    ```
3. Add an entry for the new version to the `CHANGELOG.md` file.
4. Commit these updates to the master branch.
5. Ensure you have the latest version of the master branch:
    ```bash
    git checkout master
    git pull
    ```
6. Create a release with the following commands:
    ```bash
    git tag -a $(jq -r '.version' package.json) -m "Release $(jq -r '.version' package.json)"
    git push origin $(jq -r '.version' package.json)
    ```

This process will automatically trigger a GitHub action to build the plugin and upload it to the release.
