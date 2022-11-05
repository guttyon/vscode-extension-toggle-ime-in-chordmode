///// <reference path="impl_win.ts"/>
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import * as ffi from 'ffi-napi';
// import { win32 } from 'path';
import * as implwin from './impl_win';
import * as impllinux from './impl_linux';
// import * as electron from 'electron';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "toggle-ime-in-ChordMode" is now active!');
	const is_win = process.platform === 'win32';
	const is_linux = process.platform === 'linux';

	if(is_win){
		implwin.activate();
	}
	if(is_linux){
		impllinux.activate();
	}
	
	function switchIme(enable:number){
		if(is_win){
			return implwin.switchIme(enable);
		}
		if(is_linux){
			return impllinux.switchIme(enable);
		}
	}
	function switchImeTo(enable:number){
		if(is_win){
			return implwin.switchImeTo(enable);
		}
		if(is_linux){
			return impllinux.switchIme(enable);
		}
	}
	function toggleIme():boolean{
		let isIme;
		if(is_win){
			isIme = implwin.toggleIme();
		}else if(is_linux){
			isIme = impllinux.toggleIme();
		}else{
			isIme = false; // dummy
		}
		return isIme;
	}
	type FunctionPropertyNames<T> = {
		[K in keyof T]: T[K] extends Function ? K : never;
	}[keyof T];
	interface Part {
		id: number;
		name: string;
		subparts: Part[];
		updatePart(newName: string): void;
	};
	type mmmm = never|string;
	type zzz<T> = [keyof T];
	type dd = zzz<Part>;
	type T40 = FunctionPropertyNames<Part>; // "updatePart"


	let str2CursoStyle :Record<keyof typeof vscode.TextEditorCursorStyle, vscode.TextEditorCursorStyle>= {
		"Block": vscode.TextEditorCursorStyle.Block,
		"BlockOutline": vscode.TextEditorCursorStyle.BlockOutline,
		"Line": vscode.TextEditorCursorStyle.Line,
		"LineThin": vscode.TextEditorCursorStyle.LineThin,
		"Underline": vscode.TextEditorCursorStyle.Underline,
		"UnderlineThin": vscode.TextEditorCursorStyle.UnderlineThin,
	};
	type yyy = {
		[K in keyof typeof vscode.TextEditorCursorStyle]: vscode.TextEditorCursorStyle;
	}
	type uCursorStyle = keyof typeof vscode.TextEditorCursorStyle;

	function changeCursorStyle(isIme:boolean){
		let useStyle = vscode.workspace.getConfiguration().get<boolean>('toggle-ime.change-cursor.enable');
		if(!useStyle)return;

		let styleStr;
		if(isIme){
			//style = vscode.TextEditorCursorStyle.Block;
			styleStr = vscode.workspace.getConfiguration().get<string>('toggle-ime.cursor-style.ime')! as uCursorStyle;
		}else{
			// style = vscode.TextEditorCursorStyle.Line;
			styleStr = vscode.workspace.getConfiguration().get<string>('toggle-ime.cursor-style.direct')! as uCursorStyle;
		}
		let style = str2CursoStyle[styleStr];
		vscode.window.activeTextEditor!.options.cursorStyle = style;
	}

	let disposable = vscode.commands.registerCommand('keybindingChordMode', (enable:number) => {
		let message = `toggle-ime-in-ChordMode.keybindingChordMode:${enable}`;
		vscode.window.showInformationMessage(message);
		switchIme(enable);
	});

	let disposable2 = vscode.commands.registerCommand('toggle-ime.toggleIme', () => {
		// let message = `toggle-ime-in-ChordMode.toggleIme`;
		// vscode.window.showInformationMessage(message);
		let isIme = toggleIme();
		changeCursorStyle(isIme);
	});


	let disposable3 = vscode.commands.registerCommand('toggle-ime.switchImeOn', () => {
		switchImeTo(1);
		changeCursorStyle(true);
	});

	let disposable4 = vscode.commands.registerCommand('toggle-ime.switchImeOff', () => {
		switchImeTo(0);
		changeCursorStyle(false);
	});

	function setImeHook(){
		if(is_win){
			implwin.setImeHook();
		}
	}

	let disposable5 = vscode.commands.registerCommand('toggle-ime.hook', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let message = `toggle-ime.hook`;
		vscode.window.showInformationMessage(message);
		setImeHook();
	});

	
	context.subscriptions.push(disposable, disposable2, disposable3, disposable4, disposable5);
}

// this method is called when your extension is deactivated
export function deactivate() {}
