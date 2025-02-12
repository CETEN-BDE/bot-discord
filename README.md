![GitHub Release](https://img.shields.io/github/v/release/CETEN-BDE/basic-project)
![GitHub License](https://img.shields.io/github/license/CETEN-BDE/basic-project)
![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/CETEN-BDE/basic-project) <!-- Remove this if you do not want the codeclimate badge-->

<!-- TEMPLATE INSTRUCTIONS -->
# Basic project template

This is a generic project template, without a specific programming language. It should follow the general workflow for the organization, and should be used when creating a new project.

More specific templates will be available later for more specialized projects (backend api, web front ...), with CI/CD already setup. Fore more information, see the [organization's templates](https://github.com/orgs/CETEN-BDE/repositories?q=template%3Atrue+archived%3Afalse).

## Template content

- Default MIT license
- README.md template with badges
- Issue labels
- Issue templates (soon)
- Branch protection rules

## How to use this template

1. Click on the "Use this template" button on the top right of the repo's page.
3. Follow the next steps to setup the newly created repository

### Git flow and branch protections

To follow the git flow structure, create a branch named main, and import the rulesets located in the `rulesets` folder. You can delete the folder after importing.

### Update the issue templates

Change the assignees for each issue template in the [`.github/ISSUE_TEMPLATE`](.github/ISSUE_TEMPLATE) folder.

### Update the README

The easiest way to use this README template is with a text editor that supports replacing strings with regexp (eg. vscode).

#### Code Climate maintainability badge

This badge displays the CodeClimate maintainability report for the repository. For this badge to work, you need to [add the created repository in codeclimate](https://codeclimate.com/github/repos/new).

Login with your github account, the CETEN-BDE organization should already allow access for codeclimate. Contact the CETEN-BDE maintainers if you need help for this step.

If the repository needs to remain private, or maintainability is irrelevant, remove the badge from the top of the README.

#### Fill the template

Fill the README template below these instructions. You can replace the following placeholders :

- `PROJECT_TITLE` : The project name, used in the title
- `basic-project` : The name of the repository (the part after the organization's name in the URL)

#### Remove the template instructions

When everything is setup, remove these instructions from the README. This can be done eaysily by replacing the following regexp with an empty string :

```regex
<!-- TEMPLATE INSTRUCTIONS -->(.|\n)*<!-- TEMPLATE INSTRUCTIONS -->
```

<br/>
<br/>

Following this line is the README.md template to fill.

---

<!-- TEMPLATE INSTRUCTIONS -->
# PROJECT_TITLE

Quick description of the project, what's its use

<!-- GETTING STARTED, INSTALLATION INSTRUCTIONS -->
## Getting Started

Provide the steps to setup a working copy locally here. Exemple : 

To get a local copy up and running follow these steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/CETEN-BDE/basic-project.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```
   
<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<!-- CONTRIBUTING -->
## Contributing

See the organization's [contributing guidelines](https://github.com/CETEN-BDE/.github/CONTRIBUTING.md)
