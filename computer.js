function Computer(ID, classID, x, y)
{
	this.ID = ID;
	this.classID = classID;

	this.element = null; // Icon
	this.textElement = null; // ID text

	// Simulation
	this.outSpeed = null; // Speed the data can be transferred from this computer with
	// Расчёт:
	// 1. Начинаем с выходов, у них бесконечная скорость выхода
	// 2. Просматриваем все соединения, входим в соединённые компьютеры, устанавливаем максимальную из возможных скоростей
	// 3. Рекурсивно просчитываем для всех компьютеров

	// Процесс симуляции:
	// 1. Взять все компьютеры, кроме входов
	// 2. Загрузить в них поочерёдно данные со всех соединений, на другом конце которых компьютеры с не большим outSpeed или со входов
	this.currentProcData = null;
	this.currentUnprocData = null;

	this.dataSpeedLeft = null;
}

Computer.prototype.Compute = function(Mult)
{
	const capacity = this.GetClass().dataCapacity - this.currentProcData - this.currentUnprocData;
	const computedData = Math.min(this.currentUnprocData, Math.floor(this.GetClass().computingSpeed * Mult), capacity);

	netComp[0] += computedData;

	this.currentUnprocData -= computedData;
	this.currentProcData += computedData;
}

Computer.prototype.GetConnections = function()
{
	let connections = [];

	for (const wire of Wires)
	{
		if (wire.aID === this.ID || wire.bID === this.ID)
		{
			connections.push(wire);
		}
	}

	return connections;
}

Computer.prototype.GetConnectedComputers = function()
{
	const connections = this.GetConnections();
	const connectedComputers = [];

	for (const connection of connections)
	{
		const connectedComputerID = this.GetConnectedComputerID(connection);

		connectedComputers.push(GetComputerInstance(connectedComputerID));
	}

	return connectedComputers;
}

Computer.prototype.GetConnectionByConnectedComputerID = function(conID)
{
	for (const wire of Wires)
	{
		if ((wire.aID === this.ID && wire.bID === conID) || (wire.bID === this.ID && wire.aID === conID))
		{
			return wire;
		}
	}

	return null;
}

Computer.prototype.GetConnectedComputerID = function(wire)
{
	if (wire.aID === this.ID) return wire.bID;
	else return wire.aID;
}

Computer.prototype.UpdateTextElement = function()
{
	const diskUsage = this.dataSpeedLeft != null ?
		(1 - (this.dataSpeedLeft / (this.GetClass().dataSpeed * simSecondsPerTick))) * 100
		: null;

	this.textElement.innerHTML = "кл " + this.classID.toString() + " : " + this.ID.toString() +
		"<br>Выдача: " + (this.outSpeed != null ? this.outSpeed.toString() : "-") +
		(simCalc() ? "<br>Необр: " + (this.currentUnprocData != null ? this.currentUnprocData.toString() : "-") : "") +
		"<br>Обр: " + (this.currentProcData != null ? this.currentProcData.toString() : "-") +
		"<br>Диск: " +
		(diskUsage != null ? diskUsage.toFixed(2) + "%" : "-");
}

Computer.prototype.GetClass = function()
{
	for (const compClass of Classes)
	{
		if (compClass.ID === this.classID) return compClass;
	}

	return null;
}

function GetComputerClass(id)
{
	for (const compClass of Classes)
	{
		if (compClass.ID === id) return compClass;
	}

	return null;
}

function SetDragPosition(event)
{
	const id = ComputerIDFromElementID(event.target.id);
	const textElement = GetComputerInstance(id).textElement;

	const targetX = event.clientX - 32;
	const targetY = event.clientY - 32;
	event.target.style.transform = "translate(" + targetX.toString() + "px, " + targetY.toString() + "px)";
	textElement.style.transform = "translate(" + targetX.toString() + "px, " + (targetY + 64).toString() + "px)";

	const connections = GetComputerInstance(ComputerIDFromElementID(event.target.id)).GetConnections();
	for (const wire of connections)
	{
		wire.UpdatePlacement();
	}
}

function ComputerDragging(event)
{
	SetDragPosition(event);
}

function ComputerDraggingEnd(event)
{
	SetDragPosition(event);
}

function ComputerIDFromElementID(elementID)
{
	return parseInt(elementID.substring(8));
}

function ComputerRemove(event)
{
	const id = ComputerIDFromElementID(event.target.id);
	const instance = GetComputerInstance(id);
	const textElement = instance.textElement;

	Computers.splice(Computers.indexOf(instance), 1);
	document.body.removeChild(event.target);
	document.body.removeChild(textElement);

	RemoveWiresOf(id);
}

function GetComputerInstance(id)
{
	for (const computer of Computers)
	{
		if (computer.ID === id) return computer;
	}
}