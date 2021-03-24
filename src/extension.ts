// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getValidActiveTextEditor } from "./utils/getValidActiveTextEditor";
import { getWebviewContent } from "./utils/getWebviewContent";
import { prepareEntryFile } from "./utils/prepareEntryFile";

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
	context.subscriptions.push(
		vscode.commands.registerCommand("react-component-preview.preview", () => {
			// The code you place here will be executed every time your command is executed
			AppPanel.createOrShow(context);
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument(textDocument => {
			AppPanel.createOrShow(context);
		})
	);

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(textDocument => {
			// vscode.window.showInformationMessage(
			// 	"Closed file: " + textDocument.fileName
			// );
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

class AppPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AppPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private readonly _associatedTextEditor: vscode.TextEditor;

	constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		associatedTextEditor: vscode.TextEditor
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._associatedTextEditor = associatedTextEditor;

		// Set the webview's initial html content
		this.updatePanel();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose());
	}

	public updatePanel() {
		this._panel.webview.html = getWebviewContent(
			this._panel.webview,
			this._extensionUri
		);
	}

	public static createOrShow(context: vscode.ExtensionContext) {
		const activeTextEditor = getValidActiveTextEditor();
		if (!activeTextEditor) {
			vscode.window.showErrorMessage("No active JS file in editor");
			return;
		}

		// If we already have a panel, show it if its the same file else clear previous and show new.
		if (AppPanel.currentPanel) {
			// If current active file is same as the previous for which panel was opened.
			if (
				AppPanel.currentPanel._associatedTextEditor.document.fileName ===
				activeTextEditor.document.fileName
			) {
				AppPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
				AppPanel.currentPanel.updatePanel();
				return;
			}

			AppPanel.currentPanel.dispose();
		}

		// Otherwise, create a new panel.
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

		prepareEntryFile(context.extensionUri, activeTextEditor);

		AppPanel.currentPanel = new AppPanel(
			panel,
			context.extensionUri,
			activeTextEditor
		);
	}

	public dispose() {
		AppPanel.currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
	}
}
