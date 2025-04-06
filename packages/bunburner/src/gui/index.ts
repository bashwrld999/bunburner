import {
	Box,
	ConfirmPopup,
	type ConsoleGuiOptions,
	ConsoleManager,
	InPageWidgetBuilder,
	PageBuilder,
} from "console-gui-tools";

export class GuiManager {
	private connectionState = false;
	private pendingFiles = 0;
	public options: ConsoleGuiOptions = {
		title: "BunBurner",
		layoutOptions: {
			type: "double",
			direction: "horizontal",
			pageRatio: [0.4, 0.6],
			boxed: true, // Set to true to enable boxed layout
			showTitle: true, // Set to false to hide title
			changeFocusKey: "ctrl+l", // Change layout with ctrl+l to switch to the logs page
			boxColor: "yellow",
			boxStyle: "bold",
			fitHeight: true,
		},
		//logPageSize: process.stdout.rows - 2,
	};
	public gui = new ConsoleManager(this.options);

	public constructor() {
		this.initEvents();
		this.createGui();
		this.gui.refresh();
	}

	private closeApp() {
		console.clear();
		process.exit();
	}

	private initEvents() {
		this.gui.on("exit", () => {
			this.closeApp();
		});

		this.gui.on("keypressed", (key) => {
			switch (key.name) {
				case "f10":
				case "q":
					new ConfirmPopup({
						id: "popupQuit",
						title: "Are you sure you want to quit?",
					})
						.show()
						.on("confirm", () => this.closeApp());
					break;
				case "s":

					this.gui.refresh();
					break;
				case "a":
					this.changePendingFiles(this.pendingFiles - 1);
					this.gui.refresh();
					break;
				case "d":
					this.changePendingFiles(this.pendingFiles + 1);
					this.gui.refresh();
					break;
				default:
					break;
			}
		});
	}

	private createGui() {
		const connStatusText = " Status ";
		const connBox = new Box({
			id: "connection",
			x: 10,
			y: 3,
			width: connStatusText.length,
			height: 1,
			style: {
				boxed: false,
			},
		});

		const widget1 = new InPageWidgetBuilder();
		widget1.addRow({
			text: connStatusText,
			bg: this.connectionState ? "bgGreen" : "bgRed",
			bold: true,
		});

		connBox.setContent(widget1);

		this.gui.addListener("connectionUpdate", () => {
			widget1.clear();
			widget1.addRow({
				text: connStatusText,
				bg: this.connectionState ? "bgGreen" : "bgRed",
				bold: true,
			});
			connBox.update();
		});

		const portText = "Port: 12525";
		const portBox = new Box({
			id: "info",
			x: 8,
			y: 5,
			width: portText.length,
			height: 1,
			style: {
				boxed: false,
			},
		});

		const widget2 = new InPageWidgetBuilder();
		widget2.addRow({
			text: portText,
		});

		portBox.setContent(widget2);

		let pendingFileText = `Pending: ${this.pendingFiles} ${this.pendingFiles === 1 ? "File" : "Files"}`;
		const pendingBox = new Box({
			id: "pending",
			x: 6,
			y: 6,
			width: pendingFileText.length + 5,
			height: 1,
			style: {
				boxed: false,
			},
		});

		const widget3 = new InPageWidgetBuilder();
		widget3.addRow({
			text: pendingFileText,
		});

		pendingBox.setContent(widget3);

		this.gui.addListener("pendingFilesUpdate", () => {
			widget3.clear();
			pendingFileText = `Pending: ${this.pendingFiles} ${this.pendingFiles === 1 ? "File" : "Files"}`;
			widget3.addRow({
				text: pendingFileText,
			});
			pendingBox.update();
		});

		// console.log(Math.round(this.gui.Screen.width * 0.4 - 2))
		// console.log(typeof this.gui.getLayoutOptions().pageRatio?.[0])
	}

	public changeConnectionState(state: boolean) {
		this.connectionState = state;
		this.gui.emit("connectionUpdate");
	}

	public changePendingFiles(num: number) {
		this.pendingFiles = num;
		this.gui.emit("pendingFilesUpdate");
	}
}
