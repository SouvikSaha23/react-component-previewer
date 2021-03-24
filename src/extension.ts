// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getActiveJSFileInEditor } from "./utils/getActiveJSFileInEditor";
import { getWebviewContent } from "./utils/getWebviewContent";
import { prepareJSEntryFile } from "./utils/prepareJSEntryFile";

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

			const activeJSFileInEditor = getActiveJSFileInEditor();
			if (!activeJSFileInEditor) {
				vscode.window.showErrorMessage("No active JS file in editor");
				return;
			}

			prepareJSEntryFile(context, activeJSFileInEditor);

			// Create and show a new webview
			const panel = vscode.window.createWebviewPanel(
				"react-component-preview", // Identifies the type of the webview. Used internally
				"Preview", // Title of the panel displayed to the user
				vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
				{
					// Enable javascript in the webview
					enableScripts: true,

					// And restrict the webview to only loading content from our extension's `shell-app/dist/` directory.
					localResourceRoots: [
						vscode.Uri.joinPath(context.extensionUri, "shell-app", "dist"),
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
