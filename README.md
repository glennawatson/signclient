# Sign Client

GitHub Action for using the [dotnet SignClient](https://github.com/dotnet/SignService) and perform Authenticode signing by a code signing cert held on the server. It uses Azure AD and Azure Key Vault's HSM for security.

## Example workflow - create a release
Generate changelog from git commits and use it as the body for the GitHub release.

```yaml
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10

name: Create Release

jobs:
  build:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
          
    - name: Changelog
      uses: glennawatson/ChangeLog@v1
      id: changelog
      
    - name: Save SignClient Configuration
      run: 'echo "$SIGN_CLIENT_CONFIG" > SignPackages.json'
      shell: bash
      env:
        SIGN_CLIENT_CONFIG: ${{secrets.SIGN_CLIENT_CONFIG}}

    - name: Sign NuGet Packages
      uses: glennawatson/signclient@v1
      with:
        input-files: '**/*.nupkg'
        sign-client-secret: ${{ secrets.SIGN_CLIENT_SECRET }}
        sign-client-user: ${{ secrets.SIGN_CLIENT_USER_ID }}
        project-name: ProjectName
        description: ProjectName
        config-file: SignPackages.json
        
    - name: NuGet Push
      env:
        NUGET_AUTH_TOKEN: ${{ secrets.NUGET_API_KEY }}
        SOURCE_URL: https://api.nuget.org/v3/index.json
      run: |
        dotnet nuget push -s ${{ env.SOURCE_URL }} -k ${{ env.NUGET_AUTH_TOKEN }} **/*.nupkg        
```

In the example above a [configuration file](https://github.com/dotnet/SignService#client-configuration) contents, client user name and secret at stored as secrets. 

It will run through each file and request that it be authenticode signed by the SignClient.

## Inputs

All inputs are optional.
| Input | Description | Default Value|
| --- | --- | --- |
| tool-version | The version of SignClient to use | `null` and will default to latest version. |
| follow-symbolic-links | Indicates whether to follow symbolic links | true |
| config-file | A configuration file required by the sign client. Best stored as a secret. |  |
| input-files | A glob of the files to sign | |
| base-directory | The base directory for files to override the working directory | |
| output-path | The path to the put file. May be the same as the input to overwrite. If not specified will be the input file. | |
| file-list-file | A path to a list of files to sign within within the archive. | |
| sign-client-secret | The sign client secret needed for signing. You will likely want this as a GitHub secret. | |
| sign-client-user | The sign client user needed for signing. You will likely want this as a GitHub secret. | |
| project-name | Name of project for tracking. | |
| description | Description of the project. | |
| description-url | Description of the project in url. | |
| max-concurrency | The maximum number of threads running. | 4 |

## Outputs

None
