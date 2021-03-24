import * as vscode from "vscode";
import * as fs from "fs";
import { executeCommand } from "./utils/executeCommand";
import { getValidActiveTextEditor } from "./utils/getValidActiveTextEditor";
import { getWebviewContent } from "./utils/getWebviewContent";
import { prepareEntryFile } from "./utils/prepareEntryFile";

export class AppPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: AppPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private readonly _associatedTextEditor: vscode.TextEditor;
	private readonly _outputChannel: vscode.OutputChannel;
	private _disposableAfterSetup: vscode.Disposable;
	private _disposables: vscode.Disposable[] = [];

	constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		associatedTextEditor: vscode.TextEditor,
		disposableAfterSetup: vscode.Disposable
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._associatedTextEditor = associatedTextEditor;
		this._disposableAfterSetup = disposableAfterSetup;
		this._outputChannel = vscode.window.createOutputChannel(
			"React Component Previewer"
		);

		this._init();
	}

	private _init() {
		this._disposables.push(
			vscode.workspace.onDidSaveTextDocument(textDocument => {
				AppPanel.createOrShow(this._extensionUri);
			})
		);

		/* TODO: dispose the registration */
		this._registerBuildWatcher(this._extensionUri);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this._dispose(), null, this._disposables);

		prepareEntryFile(this._extensionUri, this._associatedTextEditor);
		this._buildComponent();
		this._renderShellApp();
	}

	private _renderShellApp() {
		this._panel.webview.html = getWebviewContent(
			this._panel.webview,
			this._extensionUri
		);
	}

	private _dispose() {
		AppPanel.currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
		this._outputChannel.dispose();
		this._disposableAfterSetup.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private async _buildComponent() {
		const folderString = vscode.Uri.joinPath(this._extensionUri, "shell-app")
			.fsPath;
		const command = "yarn build";

		try {
			const { stdout, stderr } = await executeCommand(command, {
				cwd: folderString,
			});

			if (stderr && stderr.length > 0) {
				this._outputChannel.appendLine(stderr);
				// this._outputChannel.show(true);
			}
			if (stdout) {
				this._disposableAfterSetup.dispose();
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

	private _setDisposableAfterSetup(disposableAfterSetup: vscode.Disposable) {
		this._disposableAfterSetup = disposableAfterSetup;
	}

	private _registerBuildWatcher(extensionUri: vscode.Uri) {
		/* TODO: Listen for all files under shell-app/dist/    */
		const pattern = vscode.Uri.joinPath(
			extensionUri,
			"shell-app",
			"dist",
			"bundle.js"
		).fsPath;

		let fsWait = false;

		/* TODO: error handling here */
		fs.watch(pattern, null, (event, fileName) => {
			if (fileName) {
				if (fsWait) {
					return;
				}
				fsWait = true;
				setTimeout(() => {
					fsWait = false;
				}, 100);

				vscode.window.showInformationMessage("Updated file: " + fileName);
				this._renderShellApp();
			}
		});
	}

	public static createOrShow(extensionUri: vscode.Uri) {
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
				AppPanel.currentPanel._buildComponent();
				AppPanel.currentPanel._setDisposableAfterSetup(
					vscode.window.setStatusBarMessage("Building your component..")
				);
				return;
			}

			AppPanel.currentPanel._dispose();
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			"react-component-previewer", // Identifies the type of the webview. Used internally
			"React Previewer", // Title of the panel displayed to the user
			vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
			{
				// Enable javascript in the webview
				enableScripts: true,

				// And restrict the webview to oextensionUrinly loading content from our extension's `shell-app/dist/` directory.
				localResourceRoots: [
					vscode.Uri.joinPath(extensionUri, "shell-app", "dist"),
				],
			}
		);

		const disposableAfterSetup = vscode.window.setStatusBarMessage(
			"Building your component.."
		);

		AppPanel.currentPanel = new AppPanel(
			panel,
			extensionUri,
			activeTextEditor,
			disposableAfterSetup
		);
	}
}
