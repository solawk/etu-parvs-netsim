const Computers = [];
const Wires = [];
const Classes = [];

Classes.push(new ComputerClass(1, 1e6, 100, 50));
Classes.push(new ComputerClass(2, 320e3, 500, 80));
Classes.push(new ComputerClass(3, 100e3, 300, 40));
Classes.push(new ComputerClass(4, 250e3, 40, 10));
Classes.push(new ComputerClass(5, 2e6, 150, 200));

let IDcounter = 0;

let wiringInProgress = false;

document.addEventListener('contextmenu', event => event.preventDefault());

function GetComputerImage(classID)
{
	switch (classID)
	{
		case 1: return "pcClass1.png";
		case 2: return "pcClass2.png";
		case 3: return "pcClass3.png";
		case 4: return "pcClass4.png";
		case 5: return "pcClass5.png";
		case -1: return "in.png";
		case -2: return "out.png";
	}
}

function simCalc()
{
	return document.getElementById("simCalc").checked;
}

function netSpan()
{
	return parseInt(document.getElementById("NETtimespan").value);
}

function AddComputer(classID)
{
	const newComputer = new Computer(IDcounter, classID, 200, 200);
	Computers.push(newComputer);

	const newComputerElement = document.createElement("img");
	document.body.appendChild(newComputerElement);
	newComputerElement.src = GetComputerImage(classID);
	newComputerElement.id = "computer" + IDcounter.toString();
	newComputerElement.draggable = true;
	newComputerElement.ondrag = ComputerDragging;
	newComputerElement.ondragend = ComputerDraggingEnd;
	newComputerElement.onmousedown = (event) =>
	{
		if (event.button === 1) ComputerRemove(event);

		if (event.button === 2)
		{
			const clickedID = ComputerIDFromElementID(event.target.id);

			ToggleActiveConnectionText(!wiringInProgress, clickedID);

			if (!wiringInProgress)
			{
				wiringInProgress = true;

				StartWire(clickedID);
			}
			else
			{
				wiringInProgress = false;

				if (clickedID !== Wires[Wires.length - 1].aID)
				{
					if (!WireExistsBetween(Wires[Wires.length - 1].aID, clickedID))
					{
						FinishWire(clickedID);
					}
					else
					{
						RemoveWireBetween(Wires[Wires.length - 1].aID, clickedID);
						CancelWire();
					}
				}
				else
				{
					CancelWire();
				}
			}
		}
	}
	newComputerElement.style.position = "absolute";
	newComputerElement.style.transform = "translate(700px, 200px)";
	newComputerElement.style.top = "0px";
	newComputerElement.style.left = "0px";

	const newComputerElementText = document.createElement("span");
	newComputerElementText.style.position = "absolute";
	newComputerElementText.style.transform = "translate(700px, 264px)";
	newComputerElementText.style.top = "0px";
	newComputerElementText.style.left = "0px";
	document.body.appendChild(newComputerElementText);

	newComputer.element = newComputerElement;
	newComputer.textElement = newComputerElementText;
	newComputer.UpdateTextElement();

	IDcounter++;
}

function ToggleActiveConnectionText(enabled, id)
{
	document.getElementById("activeConnection").style.visibility = enabled ? "visible" : "hidden";
	document.getElementById("activeConnectionId").style.visibility = enabled ? "visible" : "hidden";
	document.getElementById("activeConnectionId").innerHTML = id.toString();
}

function StartWire(aID)
{
	Wires.push(new Wire(aID, null, parseFloat(document.getElementById("wireBandwidthInput").value)));
}

function WireExistsBetween(aID, bID)
{
	for (const wire of Wires)
	{
		if ((wire.aID === aID && wire.bID === bID) || (wire.aID === bID && wire.bID === aID))
		{
			return true;
		}
	}

	return false;
}

function GetWireBetween(aID, bID)
{
	for (const wire of Wires)
	{
		if ((wire.aID === aID && wire.bID === bID) || (wire.aID === bID && wire.bID === aID))
		{
			return wire;
		}
	}

	return null;
}

function RemoveWireBetween(aID, bID)
{
	for (const wire of Wires)
	{
		if ((wire.aID === aID && wire.bID === bID) || (wire.aID === bID && wire.bID === aID))
		{
			document.body.removeChild(wire.element);
			document.body.removeChild(wire.textElement);

			Wires.splice(Wires.indexOf(wire), 1);
		}
	}
}

function RemoveWiresOf(ID)
{
	for (let i = 0; i < Wires.length; i++)
	{
		const wire = Wires[i];

		if (wire.aID === ID || wire.bID === ID)
		{
			document.body.removeChild(wire.element);
			document.body.removeChild(wire.textElement);

			Wires.splice(Wires.indexOf(wire), 1);
			i--;
		}
	}
}

function CancelWire()
{
	Wires.pop();
}

function FinishWire(bID)
{
	Wires[Wires.length - 1].bID = bID;
	PlaceWireBetween(Wires[Wires.length - 1].aID, bID);
}

function TranslateToCoordinates(translate)
{
	const withoutTranslate = translate.substring(10);
	const x = parseInt(withoutTranslate.split("px, ")[0]);
	const withoutX = withoutTranslate.split("px, ")[1];
	const y = parseInt(withoutX.split("px")[0]);

	return [x + 32, y + 32];
}

function PlaceWireBetween(aID, bID)
{
	const wireInstance = GetWireBetween(aID, bID);

	const newWireElement = document.createElement("img");
	document.body.appendChild(newWireElement);
	newWireElement.src = "wireColor.png";
	newWireElement.id = "wire" + aID + "-" + bID;
	newWireElement.style.position = "absolute";
	newWireElement.style.top = "0px";
	newWireElement.style.left = "0px";
	newWireElement.style.zIndex = "-10";

	const newWireTextElement = document.createElement("span");
	newWireTextElement.style.position = "absolute";
	newWireTextElement.style.top = "0px";
	newWireTextElement.style.left = "0px";
	newWireTextElement.innerHTML = wireInstance.bandwidth.toString();
	newWireTextElement.style.zIndex = "-10";
	document.body.appendChild(newWireTextElement);

	wireInstance.element = newWireElement;
	wireInstance.textElement = newWireTextElement;

	wireInstance.UpdatePlacement();
}

function RandomizeArray(arr)
{
	const uarr = arr.slice(0);
	const rarr = [];

	while (uarr.length > 0)
	{
		const index = Math.floor(Math.random() * uarr.length);
		rarr.push(uarr[index]);
		uarr.splice(index, 1);
	}

	return rarr;
}