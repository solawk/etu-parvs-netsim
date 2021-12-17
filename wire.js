function Wire(aID, bID, bandwidth)
{
	this.aID = aID;
	this.bID = bID;

	this.element = null;
	this.textElement = null;
	this.bandwidth = bandwidth; // MB/s

	// Simulation
	this.bandwidthLeft = 0;
}

Wire.prototype.SetHueDependingOnStress = function()
{
	const stress = 1 - ((this.bandwidthLeft / simSecondsPerTick) / this.bandwidth);
	const hue = stress * 120;
	this.element.style.filter = "hue-rotate(-" + hue.toString() + "deg)";
}

Wire.prototype.UpdatePlacement = function()
{
	const aCoords = TranslateToCoordinates(document.getElementById("computer" + this.aID).style.transform);
	const bCoords = TranslateToCoordinates(document.getElementById("computer" + this.bID).style.transform);

	const wireDimensions = [bCoords[0] - aCoords[0], bCoords[1] - aCoords[1]];
	const wireCoordinates = [(bCoords[0] + aCoords[0]) / 2, (bCoords[1] + aCoords[1]) / 2];
	const length = Math.sqrt(wireDimensions[0] * wireDimensions[0] + wireDimensions[1] * wireDimensions[1]);

	this.element.style.transform = "translate(" + wireCoordinates[0] + "px, " + wireCoordinates[1] + "px)";
	this.textElement.style.transform = "translate(" + wireCoordinates[0] + "px, " + wireCoordinates[1] + "px)";
	this.element.style.transform += " rotate(" + (Math.atan2(wireDimensions[1], wireDimensions[0]) * 57.296).toString() + "deg)";
	this.element.style.transform += " scale(" + length + ", 1)";
}