import * as vscode from "vscode";

/* TODO: Add jsx support */
export const getValidActiveTextEditor = () => {
	const editor = vscode.window.activeTextEditor;
	if (
		!editor ||
		!["javascript", "typescriptreact"].includes(editor.document.languageId)
	) {
		return null;
	}
	return editor;
};
