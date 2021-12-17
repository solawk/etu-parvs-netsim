let simSecondsPerTick = 10;
let ticksPerRealSecond = 100;

let computerClassSelected = 1;

document.getElementById("simSecondsPerTickInput").onchange =
	(event) => { simSecondsPerTick = parseFloat(event.target.value); }

document.getElementById("ticksPerRealSecondInput").onchange =
	(event) => { ticksPerRealSecond = parseFloat(event.target.value); }

document.getElementById("compClassPrev").onclick =
	(event) =>
	{
		computerClassSelected--;
		if (computerClassSelected < 1) computerClassSelected = 5;
		UpdateClassSettingsInputs();
	}

document.getElementById("compClassNext").onclick =
	(event) =>
	{
		computerClassSelected++;
		if (computerClassSelected > 5) computerClassSelected = 1;
		UpdateClassSettingsInputs();
	}

ComputerClassSettingsInputsListeners();

function UpdateClassSettingsInputs()
{
	document.getElementById("compClassDisplay").innerHTML = computerClassSelected.toString();

	document.getElementById("compClassDataCapacityInput").value = GetComputerClass(computerClassSelected).dataCapacity;
	document.getElementById("compClassDataSpeedInput").value = GetComputerClass(computerClassSelected).dataSpeed;
	document.getElementById("compClassComputingSpeedInput").value = GetComputerClass(computerClassSelected).computingSpeed;

	ComputerClassSettingsInputsListeners();
}

function ComputerClassSettingsInputsListeners()
{
	document.getElementById("compClassDataCapacityInput").onchange =
		(event) => { GetComputerClass(computerClassSelected).dataCapacity = parseFloat(event.target.value); }

	document.getElementById("compClassDataSpeedInput").onchange =
		(event) => { GetComputerClass(computerClassSelected).dataSpeed = parseFloat(event.target.value); }

	document.getElementById("compClassComputingSpeedInput").onchange =
		(event) => { GetComputerClass(computerClassSelected).computingSpeed = parseFloat(event.target.value); }
}