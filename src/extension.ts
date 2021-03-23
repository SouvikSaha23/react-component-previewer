// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(
		'Congratulations, your extension "react-component-preview" is now active!'
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
		"react-component-preview.preview",
		() => {
			// The code you place here will be executed every time your command is executed

			// Create and show a new webview
			const panel = vscode.window.createWebviewPanel(
				"react-component-preview", // Identifies the type of the webview. Used internally
				"Preview", // Title of the panel displayed to the user
				vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
				{
					// Enable javascript in the webview
					enableScripts: true,

					// And restrict the webview to only loading content from our extension's `resource` directory.
					localResourceRoots: [
						vscode.Uri.joinPath(context.extensionUri, "resource"),
					],
				}
			);

			// And set its HTML content
			panel.webview.html = getWebviewContent(
				panel.webview,
				context.extensionUri
			);
		}
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

const getWebviewContent = (
	webview: vscode.Webview,
	extensionUri: vscode.Uri
) => {
	// Local path to css styles
	const stylesPathMainPath = vscode.Uri.joinPath(
		extensionUri,
		"resource",
		"vscode.css"
	);
	// Uri to load styles into webview
	const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

	// Local path to scripts run in the webview
	const scriptPathOnDisk = vscode.Uri.joinPath(
		extensionUri,
		"resource",
		"main.js"
	);
	const scriptReactPathOnDisk = vscode.Uri.joinPath(
		extensionUri,
		"resource",
		"react.production.min.js"
	);
	const scriptReactDOMPathOnDisk = vscode.Uri.joinPath(
		extensionUri,
		"resource",
		"react-dom.production.min.js"
	);

	// And the uri we use to load this scripts in the webview
	const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
	const scriptReactUri = webview.asWebviewUri(scriptReactPathOnDisk);
	const scriptReactDOMUri = webview.asWebviewUri(scriptReactDOMPathOnDisk);

	// Use a nonce to only allow specific scripts to be run
	const nonce = getNonce();

	return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesMainUri}" rel="stylesheet">

				<title>React Component Preview</title>
			</head>
			<body>
				<div id="ext-view-port"></div>

				<!-- Load React. -->
				<script nonce="${nonce}" src="${scriptReactUri}"></script>
				<script nonce="${nonce}" src="${scriptReactDOMUri}"></script>

				<!-- Load our React component. -->
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
};

const getNonce = () => {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};
