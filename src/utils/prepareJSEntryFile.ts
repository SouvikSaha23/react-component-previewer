import * as vscode from "vscode";
const fs = require("fs");

export const prepareJSEntryFile = (context: vscode.ExtensionContext) => {
	const jsFilePath = vscode.Uri.joinPath(
		context.extensionUri,
		"shell-app",
		"src",
		"index.js"
	).fsPath;

	const jsTemplateFilePath = vscode.Uri.joinPath(
		context.extensionUri,
		"shell-app",
		"src",
		"indexTemplate.js"
	).fsPath;

	fs.readFile(
		jsTemplateFilePath,
		function (err: any, data: { toString: () => any }) {
			if (err) {
				return console.error(err);
			}

			const templateString = data.toString();
			const currentEditorFile = "a.js";
			const preparedJSContent = templateString.replace(
				"//@@",
				`import App from ${currentEditorFile};`
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
