///// <reference path="impl_win.ts"/>
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ffi from 'ffi-napi';
import { win32 } from 'path';
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
	function toggleIme(){
		if(is_win){
			return implwin.toggleIme();
		}
		if(is_linux){
			return impllinux.toggleIme();
		}
	}

	let disposable = vscode.commands.registerCommand('keybindingChordMode', (enable:number) => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let message = `toggle-ime-in-ChordMode.keybindingChordMode:${enable}`;
		vscode.window.showInformationMessage(message);
		switchIme(enable);
	});

	let disposable2 = vscode.commands.registerCommand('toggleIme', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let message = `toggle-ime-in-ChordMode.toggleIme`;
		vscode.window.showInformationMessage(message);
		toggleIme();
	});

	function setImeHook(){
		if(is_win){
			implwin.setImeHook();
		}
	}


	let disposable3 = vscode.commands.registerCommand('ime.hook', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let message = `ime.hook`;
		vscode.window.showInformationMessage(message);
		setImeHook();
	});
	
	context.subscriptions.push(disposable, disposable2, disposable3);
}

// this method is called when your extension is deactivated
export function deactivate() {}
