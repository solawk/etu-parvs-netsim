function ComputerClass(ID, dataCapacity, dataSpeed, computingSpeed)
{
	this.ID = ID;

	// Data
	this.dataCapacity = dataCapacity; // MB
	this.dataSpeed = dataSpeed; // MB/s

	// Computing
	// Считаем, что скорость обработки данных на моём компьютере - 1 байт / 20 нс или 50 МБ/с
	// (по собственному замеру кода ниже с различными модификациями):
	/*
	let c = 0;
	console.log(Date.now());

	for (let i = 0; i < 1000000; i++)
		for (let j = 0; j < 1000; j++)
			c = Math.random() * Math.random() * 1000000;

	console.log(Date.now());
	 */
	this.computingSpeed = computingSpeed; // MB/s
}