# xcode-build-github-action
![Test][0]

This action Xcode build.

## Usage

### Simple usage
```yml
- uses: akiojin/xcode-build-github-action@v1.1
  with:
    configuration: ${{ secrets.APPCENTER_ACCESS_TOKEN }}
    uuid: ${{ runner.temp }}/ProductName.ipa
    path: <ownerName>/<appName>
    output:
```

### Additional Arguments
```yml
- uses: akiojin/xcode-build-github-action@v1.1
  with:
    token: ${{ secrets.APPCENTER_ACCESS_TOKEN }}
    path: ${{ runner.temp }}/ProductName.ipa
    app: <ownerName>/<appName>
    mandatory: true
    silent: false
    group: 'Tests'
    release_notes: "<Release Notes>"
```

## Additional Arguments
See [action.yml][2] for more details.

- `token`
  - **Requied**: true
  - **Type**: string
  - **Description**: API token (App API token or User API token)
- `path`
  - **Requied**: true
  - **Type**: string
  - **Description**: ipa or apk file path
- `app`
  - **Requied**: true
  - **Type**: string
  - **Description**: Specify app in the <ownerName>/<appName> format
- `mandatory`
  - **Requied**: false
  - **Type**: boolean
  - **Description**: Make the release mandatory for the testers
  - **Default**: `false`
- `silent`
  - **Requied**: false
  - **Type**: boolean
  - **Description**: Do not notify testers of this release
  - **Default**: `false`
- `store`
  - **Requied**: false
  - **Type**: string
  - **Description**: Store name. Upload release binary and trigger distribution, at least one of store or group must be specified.
  - **Default**: `""`
- `group`
  - **Requied**: false
  - **Type**: string
  - **Description**: Comma-separated distribution group names. Upload release binary and trigger distribution, at least one of store or group must be specified.
  - **Default**: `""`
- `release_notes`
  - **Requied**: false
  - **Type**: string
  - **Description**: Release notes text (markdown supported, 5000 characters max). Bracketed by double quotation marks
  - **Default**: `""`

## License
Any contributions made under this project will be governed by the [MIT License][3].

[0]: https://github.com/akiojin/xcode-build-github-action/actions/workflows/Test.yml/badge.svg
[1]: https://github.com/microsoft/appcenter-cli
[2]: https://github.com/akiojin/xcode-build-github-action/blob/main/action.yml
[3]: https://github.com/akiojin/xcode-build-github-action/blob/main/LICENSE