import * as vscode from "vscode";

export const getWebviewContent = (
	webview: vscode.Webview,
	extensionUri: vscode.Uri
) => {
	// Local path to css styles
	const stylesPathMainPath = vscode.Uri.joinPath(
		extensionUri,
		"shell-app",
		"src",
		"vscode.css"
	);
	// Uri to load styles into webview
	const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

	// Local path to scripts run in the webview
	const scriptPathOnDisk = vscode.Uri.joinPath(
		extensionUri,
		"shell-app",
		"dist",
		"bundle.js"
	);

	// And the uri we use to load this scripts in the webview
	const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

	// Use a nonce to only allow specific scripts to be run
	const nonce = getNonce();

	return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https, data or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src https: data: ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesMainUri}" rel="stylesheet">

				<title>React Component Preview</title>
			</head>
			<body>
				<div id="ext-view-port"></div>

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
