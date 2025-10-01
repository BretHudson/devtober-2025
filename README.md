# Canvas Lord TypeScript Template

This is a reusable template for quickly getting set up with Canvas Lord, using `pnpm` and `xampp`.

## Pre-requisites

### Linking packages to global scope

In addition, within the `/canvas-lord` project, I have `pnpm link -g` two different projects within it:

-   `canvas-lord` (`/canvas-lord/engine`)
-   `@writegames.com/style-guide` (`/canvas-lord/shared-config`)

These will be required for setting up this project.

## Setup

### Link packages

Within this repo, run the following two commands:

```
pnpm link -g canvas-lord
pnpm link -g "@writegames.com/style-guide"
```

### Folder Location

I have `/canvas-lord` in my `C:/xampp/apps` folder, and co-locate the game projects next to it.

### Configuring xampp directory

I keep all public files for the game within `/[project]/bin`, which means having to navigate to `localhost/[project]/bin` (or in my case, `[project].localhost/bin`) which isn't the most ergonomic.

To get around that, I edit my `httpd-vhosts.conf` file (located at `/xampp/apache/conf/extra`) with the following code:

```xml
<VirtualHost *:80>
       ServerAlias my-project.localhost
       VirtualDocumentRoot "C:/xampp/htdocs/my-project/bin"
</VirtualHost>
```

This will allow the `/bin` directory to act as the root directory for the site :)

### Ensuring Canvas Lord is accessible

Finally, we need to make sure that `[project].localhost/canvas-lord/*` resolves to the proper files. There are two ways to do this:

1. Copy/paste `canvas-lord/engine/bin` to `/[project]/bin/js/canvas-lord`
2. Create a junction (this is my preferred method, as it allows edits made to the engine to be accessible to the game)

To create a junction on Windows, use the following command:

```cmd
mklink /j C:\xampp\apps\[my-project]\bin\js\canvas-lord C:\xampp\apps\canvas-lord\engine\bin\
```

To delete a junction, use `rmdir`.

Regardless of which method you choose, there is a `.gitignore` present in the `/bin` directory to keep those changes out of the repo.
