import * as vscode from "vscode";
import { executeCommand } from "./utils/executeCommand";
import { getValidActiveTextEditor } from "./utils/getValidActiveTextEditor";
import { getWebviewContent } from "./utils/getWebviewContent";
import { prepareEntryFile } from "./utils/prepareEntryFile";

export class AppPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	private static _currentPanel: AppPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private readonly _associatedTextEditor: vscode.TextEditor;
	private readonly _outputChannel: vscode.OutputChannel;

	constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		associatedTextEditor: vscode.TextEditor
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._associatedTextEditor = associatedTextEditor;
		this._outputChannel = vscode.window.createOutputChannel(
			"React Component Previewer"
		);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this._dispose());

		this._init();
	}

	private async _init() {
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: "Building your component...",
				cancellable: true,
			},
			(progress, token) => {
				token.onCancellationRequested(() => {
					console.log("User canceled the long running operation");
				});

				progress.report({ increment: 10 });

				prepareEntryFile(this._extensionUri, this._associatedTextEditor);

				progress.report({
					increment: 30,
				});

				return this._buildComponent();
			}
		);
		this._renderShellApp();
	}

	private _renderShellApp() {
		this._panel.webview.html = getWebviewContent(
			this._panel.webview,
			this._extensionUri
		);
	}

	private _dispose() {
		AppPanel._currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
		this._outputChannel.dispose();
	}

	private async _buildComponent() {
		const folderString = vscode.Uri.joinPath(this._extensionUri).fsPath;

		/* TODO: uninstall webpack-dev-server */
		const command = "yarn shell-app:build";

		try {
			const { stdout, stderr } = await executeCommand(command, {
				cwd: folderString,
			});

			if (stderr && stderr.length > 0) {
				this._outputChannel.appendLine(stderr);
				// this._outputChannel.show(true);
			}
			if (stdout) {
				return;
			}
		} catch (err) {
			const channel = this._outputChannel;
			if (err.stderr) {
				channel.appendLine(err.stderr);
			}
			if (err.stdout) {
				channel.appendLine(err.stdout);
			}
			channel.appendLine("Failed to start dev server.");
			channel.show(true);
		}
	}

	public static createAndLoad(extensionUri: vscode.Uri) {
		const activeTextEditor = getValidActiveTextEditor();
		if (!activeTextEditor) {
			vscode.window.showErrorMessage("No active JS file in editor");
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			"react-component-previewer", // Identifies the type of the webview. Used internally
			"React Previewer", // Title of the panel displayed to the user
			vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to extensionUri only loading content from our extension's `shell-app/dist/ and shell-app/src/` directory.
				localResourceRoots: [
					vscode.Uri.joinPath(extensionUri, "shell-app", "dist"),
					vscode.Uri.joinPath(extensionUri, "shell-app", "src"),
				],
			}
		);

		AppPanel._currentPanel = new AppPanel(
			panel,
			extensionUri,
			activeTextEditor
		);
	}

	public static updateIfExists(extensionUri: vscode.Uri) {
		if (!AppPanel._currentPanel) {
			return;
		}
		AppPanel._currentPanel._dispose();
		AppPanel.createAndLoad(extensionUri);
	}
}
