import * as vscode from "vscode";

export const getValidActiveTextEditor = () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== "javascript") {
		return null;
	}
	return editor;
};
