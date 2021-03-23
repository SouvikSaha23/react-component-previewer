import * as vscode from "vscode";

export const getActiveJSFileInEditor = () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== "javascript") {
		return "";
	}
	const activeJsFilePath = editor.document.fileName;
	return activeJsFilePath;
};
