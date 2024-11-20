# Special "Getting Started" instructions on Windows Machines

The autograder unfortunately won't work directly from Windows, so it must be run inside a Docker container
(recommended) or inside WSL, the Windows Subsystem for Linux (not recommended unless you're already familiar with WSL).
When running the autograder inside a Docker container, you will need to use a _Dev Container_ if you want to use
IntelliJ's debugging tools.

Either way, running your MySQL server locally on your Windows machine should work for the database.

## Development inside a Dev Container (recommended)

The easiest way to debug a program running inside a Docker container is via a "Dev Container," which is essentially
just a fancy term for a Docker container that's linked to an IDE. It essentially allows you to run your IDE inside the
container, which enables debugging the autograder code on Windows machines. How it works is IDE-specific; this document
provides instructions for the autograder using IntelliJ. Further reading can be
found [here](https://www.jetbrains.com/help/idea/connect-to-devcontainer.html).

This requires having Docker installed and running on your machine. It also requires the full
professional version of IntelliJ (or a student license of it).

### Setup

#### Initially Creating the Dev Container

To set up your dev container for the first time:
1. Navigate to `.devcontainer/devcontainer.json`
2. There should be an icon that pops up next to the opening curly brace
3. Click the icon, then select `Create Dev Container and Clone Sources...`. (Not to be confused
with `Mount Sources`, which doesn't quite work.)
   - This should pop up a dialog box that allows you to change a few options about the container.
   - If the "Clone Sources" option does not appear, see [No Clone Sources](#no-clone-sources).
   - Look through them and change what you need, then hit the `Build Container and Continue` button.
4. Wait for IntelliJ and Docker to build everything
   - You may need to click a few buttons along the way.
   - Eventually a new IntelliJ window will pop up from the dev container.
5. Follow the [Getting Started](getting-started.md) steps with the new window, with the following notes:
   - Use `host.docker.internal` as your db-host argument; this tells docker to look for the
     database on your local Windows machine rather than inside the container.

#### Reopening the Dev Container

To reopen the container after you've closed it:
1. Navigate to the `.devcontainer/devcontainer.json` file again, and click the icon
2. Select `Show Dev Containers`
3. Select the container
   - It should reopen the second IntelliJ.
   - If nothing appears, make sure the docker engine is running (perhaps by opening Docker Desktop).

#### <a name="no-clone-sources"></a> Alternative Path To Create A Dev Container

> [!NOTE]
> If you follow these instructions to create your Dev Container, you will also need
> an alternative path to reopen the dev container.\
> Reopen your Dev Container by starting in the Gateway tool.

If you don't see an option to `Clone Sources`, you can do the same thing via JetBrains Gateway.
1. Download and install JetBrains Gateway if you haven't already.
   - Installing via JetBrains Toolbox is probably the easiest way.
2. Open Gateway,
3. Select `Dev Containers`
4. Click `New Dev Container`
5. Choose `From VCS Project`
6. Select "Intellij IDEA" from the dropdown
7. Paste a link to the autograder GitHub repo (or your fork of it)
8. Continue setting up the Dev Container with steps 4 and 5 above

## Development inside WSL

> [!CAUTION]
> WSL isn't the recommended option, and these instructions might not be maintained.

> [!WARNING]
> Everything in these instructions (including everything in `getting-started.md`)
> should be done via a WSL terminal _and_ inside a WSL directory.
>
> "Unix-like" shells, such as Git Bash, will not work: it needs to be a true WSL terminal.
> Similarly, all your autograder files should be cloned into WSL's own dedicated file system.
> Yes, WSL can access your Windows files (via the `\mnt\c\` path), but with the use of a Windows
> directory like `C:\Desktop\chess`, you might face file permissions errors.

WSL 2 (Windows Subsystem for Linux 2) is essentially a Linux kernel that's built into Windows, which means you'll be
able to simply clone and run the autograder as if you were running Linux. Development is fairly simple once set up, but
getting it set up for the autograder can be a bit finicky.

### Setup

Install and configure WSL if needed. Instructions can be found
[here](https://learn.microsoft.com/en-us/windows/wsl/install).

For the `--db-host` program argument, you can't simply use `localhost` (assuming your database is running on Windows),
since that will refer to the WSL instance. Running `echo $(hostname)` from a WSL terminal will tell you what your
computer's true hostname is (ex. `LAPTOP-ABC123`). Appending `.local` to that (ex. `LAPTOP-ABC123.local`) gives you
the hostname that WSL uses to refer to the Windows machine. Use this as the `--db-host` program argument.

By default, MySQL users have "Limit to Host Matching" set to `localhost`, which does not allow requests coming from the
WSL virtual machine. You will have to expand this in MySQLWorkbench (under Server, click "Users and Privileges"). The
easiest way is to change it to `%`, which allows all hostnames (but it is highly recommended that you only do this for a
new user with restricted privileges, rather than using root). Another option is to run `wsl hostname -I` in PowerShell
to determine the WSL instance's IP address, then simply hardcode that, but this IP may change when WSL restarts.
