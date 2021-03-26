import * as vscode from "vscode";
const fs = require("fs");

export const prepareEntryFile = (
	extensionUri: vscode.Uri,
	activeTextEditor: vscode.TextEditor
) => {
	const activeFileName = activeTextEditor.document.fileName;
	const activeFileNameWithoutExtension = activeFileName.replace(
		/\.[^/.]+$/,
		""
	);

	const entryFilePath = vscode.Uri.joinPath(
		extensionUri,
		"shell-app",
		"src",
		"index.tsx"
	).fsPath;

	const templateFilePath = vscode.Uri.joinPath(
		extensionUri,
		"shell-app",
		"src",
		"indexTemplate.tsx"
	).fsPath;

	fs.readFile(
		templateFilePath,
		function (err: any, data: { toString: () => any }) {
			if (err) {
				vscode.window.showErrorMessage("Failed to read active .js/.tsx file!");
				return;
			}

			const templateString = data.toString();
			const preparedContent = templateString
				.replace("//@@", `import App from "${activeFileNameWithoutExtension}";`)
				.replace("{/*@@*/}", "<App/>");

			console.log("Prepared entry file successfully!");

			fs.writeFile(entryFilePath, preparedContent, (err: string) => {
				if (err) {
					console.error("Error occurred: " + err);
				} else {
					console.log("Written in JS file successfully!");
				}
			});
		}
	);
};
