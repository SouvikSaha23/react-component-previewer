import * as vscode from "vscode";
const fs = require("fs");

export const prepareEntryFile = (
	extensionUri: vscode.Uri,
	activeTextEditor: vscode.TextEditor
) => {
	const activeFileName = activeTextEditor.document.fileName;

	const jsFilePath = vscode.Uri.joinPath(
		extensionUri,
		"shell-app",
		"src",
		"index.js"
	).fsPath;

	const jsTemplateFilePath = vscode.Uri.joinPath(
		extensionUri,
		"shell-app",
		"src",
		"indexTemplate.js"
	).fsPath;

	fs.readFile(
		jsTemplateFilePath,
		function (err: any, data: { toString: () => any }) {
			if (err) {
				vscode.window.showErrorMessage("Failed to read active JS file!");
				return;
			}

			const templateString = data.toString();
			const preparedJSContent = templateString.replace(
				"//@@",
				`import App from "${activeFileName}";`
			);

			console.log("Prepared JS content successfully!");

			fs.writeFile(jsFilePath, preparedJSContent, (err: string) => {
				if (err) {
					console.error("Error occurred: " + err);
				} else {
					console.log("Written in JS file successfully!");
				}
			});
		}
	);
};
