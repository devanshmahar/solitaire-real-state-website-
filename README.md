# The Solitaire Group website

Static website for The Solitaire Group. GitHub Pages deploys the site automatically whenever a change is pushed to the `main` branch.

## First-time GitHub setup

1. Create an empty **public** repository on GitHub, for example `solitaire-static`. Do not initialize it with a README, license, or `.gitignore`.
2. In this folder, connect the repository and push the website:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/solitaire-static.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
4. Open the repository's **Actions** tab and wait for **Deploy website to GitHub Pages** to complete. GitHub will show the published URL in the deployment details.

Subsequent pushes to `main` deploy the updated site automatically. The project is plain HTML, CSS, JavaScript, and static media; it does not need a build step or server.
