let netInput = [];
let netComp = [];
let netBandwidth = [];

const computersToReceiveOutData = [];

let simulationOn = false;
let simulationIntervalHandle = null;

function start()
{
	const comps = allComputers();

	for (const comp of comps)
	{
		if (simCalc())
			comp.currentUnprocData = comp.GetClass().dataCapacity * parseFloat(document.getElementById("startFillInput").value);
		comp.currentProcData = comp.GetClass().dataCapacity * parseFloat(document.getElementById("startProcFillInput").value);
	}

	calculateOutSpeed();
}

function switchSimulation()
{
	if (!simulationOn)
	{
		simulationOn = true;
		simulationIntervalHandle = setInterval(tick, 1000 / ticksPerRealSecond);
	}
	else
	{
		simulationOn = false;
		clearInterval(simulationIntervalHandle);
	}
}

function tick()
{
	// Stats

	if (netInput.length >= netSpan())
	{
		netInput.pop();
	}

	netInput.unshift(0);

	if (netComp.length >= netSpan())
	{
		netComp.pop();
	}

	netComp.unshift(0);

	if (netBandwidth.length >= netSpan())
	{
		netBandwidth.pop();
	}

	netBandwidth.unshift(0);


	const comps = allComputers();

	// Computing

	if (simCalc())
	{
		const calcRandomness = parseFloat(document.getElementById("randomnessCalcInput").value);
		const calcRandomizedVolume = (1 - calcRandomness) + (Math.random() * calcRandomness);

		for (const comp of comps)
		{
			comp.Compute(calcRandomizedVolume * simSecondsPerTick);
		}
	}

	// Transportation

	const randomness = parseFloat(document.getElementById("randomnessInput").value);

	// Обнулить загруженности дисков компьютеров

	for (const comp of comps)
	{
		comp.dataSpeedLeft = comp.GetClass().dataSpeed * simSecondsPerTick;
	}

	// Обнулить загруженность проводов

	for (const wire of Wires)
	{
		wire.bandwidthLeft = wire.bandwidth * simSecondsPerTick;
	}

	// Заполнить список компьютеров, требующих получения данных
	// Обработать их в стохастическом порядке

	const unmixedReceivers = allOutDataReceivers();
	const mixedReceivers = RandomizeArray(unmixedReceivers);

	for (const rec of mixedReceivers)
	{
		const connectedComputers = rec.GetConnectedComputers();
		if (connectedComputers === []) continue;

		for (const con of connectedComputers)
		{
			if (con.classID === -2) continue;

			const wire = rec.GetConnectionByConnectedComputerID(con.ID);
			const bandLeft = wire.bandwidthLeft;
			let connectionSpeed;
			let transmittedData;

			const transmissionRandomizedVolume = (1 - randomness) + (Math.random() * randomness);

			if (rec.classID !== -2)
			{
				const dataCapacityLeft = rec.GetClass().dataCapacity - rec.currentProcData - rec.currentUnprocData;

				if (con.classID !== -1)
				{
					let sendingProc = true;

					if (simCalc() && con.currentUnprocData > 0 && Math.random() < 0.3) sendingProc = false;

					connectionSpeed = Math.min(rec.dataSpeedLeft, con.dataSpeedLeft, bandLeft);

					transmittedData = Math.min(dataCapacityLeft,
						sendingProc ? con.currentProcData : con.currentUnprocData,
						connectionSpeed)
						* transmissionRandomizedVolume;
					transmittedData = Math.floor(transmittedData);

					wire.bandwidthLeft -= transmittedData;

					rec.dataSpeedLeft -= transmittedData;
					if (sendingProc)
						rec.currentProcData += transmittedData;
					else
						rec.currentUnprocData += transmittedData;

					con.dataSpeedLeft -= transmittedData;
					if (sendingProc)
						con.currentProcData -= transmittedData;
					else
						con.currentUnprocData -= transmittedData;
				}
				else
				{
					connectionSpeed = Math.min(rec.dataSpeedLeft, bandLeft);

					transmittedData = Math.min(dataCapacityLeft, connectionSpeed)
						* transmissionRandomizedVolume;
					transmittedData = Math.floor(transmittedData);

					wire.bandwidthLeft -= transmittedData;

					rec.dataSpeedLeft -= transmittedData;
					if (!simCalc())
						rec.currentProcData += transmittedData;
					else
						rec.currentUnprocData += transmittedData;

					netInput[0] += transmittedData;
				}
			}
			else
			{
				if (con.classID !== -1)
				{
					connectionSpeed = Math.min(con.dataSpeedLeft, bandLeft);

					transmittedData = Math.min(con.currentProcData, connectionSpeed)
						* transmissionRandomizedVolume;
					transmittedData = Math.floor(transmittedData);

					wire.bandwidthLeft -= transmittedData;

					con.dataSpeedLeft -= transmittedData;
					con.currentProcData -= transmittedData;
					netBandwidth[0] += transmittedData;
				}
			}
		}
	}

	for (const comp of Computers)
	{
		comp.UpdateTextElement();
	}

	for (const wire of Wires)
	{
		wire.SetHueDependingOnStress();
	}

	calculateStat(netBandwidth, document.getElementById("NETbandwidth"));
	calculateStat(netComp, document.getElementById("NETcomp"));
	calculateStat(netInput, document.getElementById("NETinput"));
}

function calculateOutSpeed()
{
	// Задать выходам бесконечную скорость выхода
	for (const comp of Computers)
	{
		if (comp.classID === -1) comp.outSpeed = "none";
		if (comp.classID === -2) comp.outSpeed = "infinite";
	}

	// Задавать обычным компьютерам выходную скорость итеративно
	let changesMade = true;
	while (changesMade)
	{
		changesMade = false;

		for (const comp of Computers)
		{
			if (comp.classID === -1 || comp.classID === -2) continue;

			const connectedComputers = comp.GetConnectedComputers();
			if (connectedComputers === [])
			{
				comp.outSpeed = 0;
				continue;
			}

			// Скорость выдачи равна максимуму из суммы (скорость выдачи соединённого + скорость кабеля) и не больше скорости диска
			let maxOutSpeed = 0;

			for (const conComp of connectedComputers)
			{
				let connectionOutSpeed;

				if (conComp.outSpeed == null) continue;
				else if (conComp.outSpeed === "none") continue;
				else if (conComp.outSpeed === "infinite")
				{
					connectionOutSpeed = comp.GetConnectionByConnectedComputerID(conComp.ID).bandwidth;
				}
				else
				{
					connectionOutSpeed = Math.min(conComp.outSpeed, comp.GetConnectionByConnectedComputerID(conComp.ID).bandwidth);
				}

				if (maxOutSpeed < connectionOutSpeed) maxOutSpeed = connectionOutSpeed;
			}

			const newOutSpeed = Math.min(comp.GetClass().dataSpeed, maxOutSpeed);
			if (newOutSpeed !== comp.outSpeed)
			{
				changesMade = true;
				comp.outSpeed = newOutSpeed;
			}
		}
	}

	for (const comp of Computers)
	{
		comp.UpdateTextElement();
	}
}

function allComputers()
{
	const comps = [];

	for (const comp of Computers)
	{
		if (comp.classID === -1 || comp.classID === -2) continue;

		comps.push(comp);
	}

	return comps;
}

function allOutDataReceivers()
{
	// Взять все компьютеры, не являющиеся входами

	const outReceivers = [];

	for (const comp of Computers)
	{
		if (comp.classID === -1) continue;

		outReceivers.push(comp);
	}

	return outReceivers;
}

function calculateStat(inputArray, outputSpan)
{
	let avg = 0;
	inputArray.forEach((elem) => { avg += elem / inputArray.length; });

	outputSpan.innerHTML = (avg / simSecondsPerTick).toFixed(3);
}