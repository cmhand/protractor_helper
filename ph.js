(function(){
	var Recorder = (function(scriptBuilder) {
		var server = "http://cmhand.ingrnet.com:4321/";
		var steps = [];

		function Recorder(scriptBuilder) {
			var _this = this;
			_this.scriptBuilder = scriptBuilder;
			_this.container = document.createElement("div");
			_this.container.style.position = "fixed";
			_this.container.style.zIndex = "100000";
			_this.container.style.top = "10px";
			_this.container.style.right = "50px";
			_this.container.style.height = "100px";
			_this.container.style.width = "200px";
			_this.container.style.backgroundColor = "#fff";
			_this.container.style.border = "1px solid #000";
			_this.container.setAttribute("class", "ph_recorder_container ph_thing");
			_this.addLabel();
			_this.addButtons();
			_this.addStyles();

			document.body.appendChild(_this.container);
		}

		Recorder.prototype.addStyles = function() {
			var actionStyle = ".ph_actions {border: 5px solid #00f;}";
			var assertStyle = ".ph_assert {border: 5px solid #0f0;}";
			var pauseStyle = ".ph_pause {border: 5px solid #f00;}";

			injectStyles(actionStyle);
			injectStyles(assertStyle);
			injectStyles(pauseStyle);

			var btnStyle = ".ph_btn { display: inline-block;";
				btnStyle += "width: 19.5%;";
				btnStyle += "height: 40px;";
				btnStyle += "color: #000;";
				btnStyle += "font-size: 40px;";
				btnStyle += "text-align: center;";
				btnStyle += "line-height: 40px;";
				btnStyle += "cursor: pointer;";
				btnStyle += "}";
			injectStyles(btnStyle);
			var hoverStyle = ".ph_btn:hover { background-color: #e5f5ff; }";
			injectStyles(hoverStyle);
		}

		Recorder.prototype.addLabel = function() {
			this.label = document.createElement("div");
			var lbl = this.label;
			lbl.textContent = "Recorder";
			lbl.style.fontSize = "24px";
			lbl.style.padding = "5px";
			this.container.appendChild(lbl);
		};

		Recorder.prototype.addButtons = function() {
			var _this = this;
			this.startButton = document.createElement("span");
			this.pauseButton = document.createElement("span");
			this.stopButton = document.createElement("span");
			this.assertButton = document.createElement("span");
			this.saveButton = document.createElement("span");
			this.actionButton = document.createElement("span");
			
			var startBtn = this.startButton;
			var pauseBtn = this.pauseButton;
			var stopBtn = this.stopButton;
			var assertBtn = this.assertButton;
			var saveBtn = this.saveButton;
			var actionBtn = this.actionButton;

			startBtn.innerHTML = "&#10151;";
			startBtn.setAttribute("title", "Start a step");
			stopBtn.innerHTML = "&#10008;";
			stopBtn.setAttribute("title", "Cancel recording steps");
			actionBtn.innerHTML = "&#8853;";
			actionBtn.setAttribute("title", "More action!");
			saveBtn.innerHTML = "&#10004;";
			saveBtn.setAttribute("title", "Save these steps as script");
			assertBtn.innerHTML = "&#9733;";
			assertBtn.setAttribute("title", "Make an assertion");
			pauseBtn.innerHTML = "&#10074;&#10074;";
			pauseBtn.setAttribute("title", "Pause recording steps");

			enhanceBtn(startBtn);
			enhanceBtn(pauseBtn);
			enhanceBtn(stopBtn);
			enhanceBtn(assertBtn);
			enhanceBtn(saveBtn);
			enhanceBtn(actionBtn);
			actionBtn.style.display = "none";

			startBtn.addEventListener("click", onStart);
			pauseBtn.addEventListener("click", onPause);
			stopBtn.addEventListener("click", onStop);
			assertBtn.addEventListener("click", onAssert);
			saveBtn.addEventListener("click", onSave);
			actionBtn.addEventListener("click", onAction);

			this.append(this.startButton);
			this.append(this.pauseButton);
			this.append(this.stopButton);
			this.append(this.assertButton);
			this.append(this.actionButton);
			this.append(this.actionButton);
			this.append(this.saveButton);

			function enhanceBtn(btn) {
				btn.setAttribute("class", "ph_thing ph_btn");
			}

			function onStart() {
				console.log("started");
				// This goes in a timeout so we don't capture the click that "starts"
				// the recording.
				setClass("ph_actions");
				setTimeout(function() {
					window.addEventListener("mousedown", _this.listenToClicks);
					window.addEventListener("keypress", _this.listenToKeys);
				}, 100);
			}

			function onAssert() {
				setClass("ph_assert");
				checkForTyping();
				window.removeEventListener("mousedown", _this.listenToClicks);
				window.addEventListener("mousedown", _this.listenToAsserts);
				_this.actionButton.style.display	= "inline-block";
				_this.assertButton.style.display	= "none";
			}

			function onAction() {
				setClass("ph_actions");
				checkForTyping();
				window.addEventListener("mousedown", _this.listenToClicks);
				window.removeEventListener("mousedown", _this.listenToAsserts);
				_this.actionButton.style.display	= "none";
				_this.assertButton.style.display	= "inline-block";			
			}

			function onPause() {
				setClass("ph_pause");
				removeListeners();
			}

			function onStop() {
				console.log("stopped");
				steps = [];
				removeListeners();
			}

			function removeListeners() {
				window.removeEventListener("mousedown", _this.listenToClicks);
				window.removeEventListener("keypress", _this.listenToKeys);
				window.removeEventListener("mousedown", _this.listenToAsserts);
			}
			
			function onSave() {
				removeListeners();
				console.log(steps);
				var name = prompt("Please name this test: 'It should... ", "Test something");
				if(prompt !== null) {
					var data = {
						title: name,
						steps: steps
					};
					var script = _this.scriptBuilder.buildScript(data);
					_this.handleResponse(script);
					steps = [];
					setClass("");
					// $.post(server, data).then(function(d){
					// 	console.log(d);
					// 	_this.handleResponse(d);
					// });
				}
			}
		};

		Recorder.prototype.handleResponse = function(text) {
			var newDiv = document.createElement("div");
			newDiv.style.position = "fixed";
			newDiv.style.left = "10%";
			newDiv.style.top = "10%";
			newDiv.style.right = "10%";
			newDiv.style.bottom = "10%";
			newDiv.style.border = "1px solid #000";
			newDiv.style.zIndex = "1000000";
			var title = document.createElement("h3");
			title.textContent = "Generated Script";
			var closeBtn = document.createElement("span");
			closeBtn.display = "inline-block";
			closeBtn.height = "40px";
			closeBtn.width = "40px";
			closeBtn.innerHTML = "&#10060;";
			closeBtn.addEventListener("click", function() {
				newDiv.parentNode.removeChild(newDiv);
			});
			closeBtn.style.float = "right";
			closeBtn.fontSize = "40px";
			closeBtn.style.cursor = "pointer";
			title.appendChild(closeBtn);
			newDiv.appendChild(title);
			var bodyDiv = document.createElement("div");
			bodyDiv.style.whiteSpace = "pre";
			bodyDiv.textContent = text;
			newDiv.appendChild(bodyDiv);
			newDiv.style.overflowX = "hidden";
			newDiv.style.overflowY = "auto";
			newDiv.style.backgroundColor = "#fff";
			document.body.appendChild(newDiv);
		};

		var keysBeingPressed = false;
		var stringBeingTyped = "";
		var inputBeingTyped = null;
		Recorder.prototype.listenToKeys = function(event) {
			console.log("keys");
			var ele = event.target;
			var fullPath = getFullPath(ele);
			var char = String.fromCharCode(event.keyCode);
			var test = /[\W\w]/.test(char);
			if(!test) {
				return;
			}
			if(!keysBeingPressed) {
				keysBeingPressed = true;
				inputBeingTyped = fullPath;
				stringBeingTyped = char;
			} else {
				stringBeingTyped += char;
			}
		}

		Recorder.prototype.listenToAsserts = function(event) {
			console.log("assert");
			var ele = event.target;
			if($(ele).hasClass("ph_thing")) {
				console.log("Clicked the recorder");
				return;
			}
			var fullPath = getFullPath(ele);
			var content = $(ele).text().trim();
			var step = {
				type: "assertion",
				content: content,
				element: fullPath
			};
			steps.push(step);
		}

		Recorder.prototype.listenToClicks = function(event) {
			console.log("click");
			checkForTyping();
			var ele = event.target;
			if($(ele).hasClass("ph_thing")) {
				console.log("Clicked the recorder");
				return;
			}
			var fullPath = getFullPath(ele);
			var step = {
				type: "click",
				element: fullPath
			};
			steps.push(step);
		};

		function setClass(cls) {
			$("body").removeClass("ph_actions");
			$("body").removeClass("ph_assert");
			$("body").removeClass("ph_pause");
			$("body").addClass(cls);
		}

		function checkForTyping() {
			if(keysBeingPressed) {
				keysBeingPressed = false;
				var step = {
					type: "stringTyped",
					element: inputBeingTyped,
					stringTyped: stringBeingTyped
				};
				steps.push(step);
			}
		}

		function getFullPath(ele) {
			if(ele.id) {
				return "#" + ele.id;
			}
			var path = $(ele).parents().addBack();
			var selector = [];
			var descendants = path.get();
			for(var i = descendants.length - 1; i >= 0; i--) {
				var item = descendants[i];
				var self = $(item),
		            id = item.id ? '#' + item.id : '',
		            clss = item.classList.length ? item.classList.toString().split(' ').map(function (c) {
		            	c = c.split(".").join("\\\\.");
		                return '.' + c;
		            }).join('') : '',
		            name = item.nodeName.toLowerCase(),
		            index = self.siblings(name).length ? ':nth-child(' + (self.index() + 1) + ')' : '';
		        
		        if (name === 'html' || name === 'body') {
		            selector.unshift(name);
		        } else {
			        selector.unshift(name + index + id + clss);
		        }
		        var fullPath = selector.join(" > ");
		        if($(fullPath).length === 1) {
		        	return fullPath;
		        }
			}
		    return selector.join(" > ");
		}

		function injectStyles(rule) {
		  var div = $("<div />", {
		    html: '&shy;<style>' + rule + '</style>'
		  }).appendTo("body");    
		}

		Recorder.prototype.append = function(ele) {
			this.container.appendChild(ele);
		};

		return Recorder;
	})(scriptBuilder);

	var ScriptBuilder = (function() {
		function ScriptBuilder () {
			this.scriptString = "";
		}

		ScriptBuilder.prototype.buildScript = function(data) {
			var steps = data.steps;
			this.handleStart(data.title);
			for(var i = 0; i < steps.length; i++) {
				var step = steps[i];
				switch(step.type)
				{
					case "click" : 
						this.handleClick(step);
						break;
					case "stringTyped" :
						this.handleString(step);
						break;
					case "assertion" : 
						this.handleAssertion(step);
						break;
				}
			}
			this.handleEnd();
			return this.scriptString;
		}

		ScriptBuilder.prototype.add = function(str) {
			this.scriptString += str;
		}

		ScriptBuilder.prototype.handleStart = function(title) {
			console.log("Started writing file");
			this.scriptString = "it(\"" + title + "\", function() {\n";
		}

		ScriptBuilder.prototype.handleAssertion = function(data) {
			console.log("Writing step: Assertion");
			var content = data.content;
			var str = "";
			str = str.append_line("var identifier = \"" + data.element + "\";");
			str = str.append_line("browser.wait(EC.presenceOf($(identifier)), 10000);");
			str = str.append_line("expect($(identifier).isPresent()).toEqual(true);");
			var strAssert = "expect($(identifier).getText()).toEqual(\"" + content + "\");";
			str = str.append_line(strAssert);
			this.add(str);
		}

		ScriptBuilder.prototype.handleString = function(data) {
			console.log("Writing step: String");
			var currentString = getClickableIdentifier(data);
			currentString = currentString.append_line("$(identifier).sendKeys(\"" + data.stringTyped + "\");");
			this.add(currentString);
		}

		ScriptBuilder.prototype.handleClick = function(data) {
			console.log("Writing step: Click");
			var currentString = getClickableIdentifier(data);
			currentString = currentString.append_line("$(identifier).click();");
			this.add(currentString);
		}

		function getClickableIdentifier(data) {
			var str = "";
			str = str.append_line("var identifier = \"" + data.element + "\";");
			str = str.append_line("browser.wait(EC.elementToBeClickable($(identifier)), 10000);")
			return str;
		}

		String.prototype.append_line = function(str) {
			return this + "\t" + str + "\n";
		};

		ScriptBuilder.prototype.handleEnd = function() {
			console.log("File ending.");
			var currentString = "});\n";
			this.add(currentString);
		}

		return ScriptBuilder;
	}());
	
	var scriptBuilder = new ScriptBuilder();
	var myRecorder = new Recorder(scriptBuilder);
}());