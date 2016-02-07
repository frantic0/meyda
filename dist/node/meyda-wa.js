'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utilities = require('./utilities');

var utilities = _interopRequireWildcard(_utilities);

var _featureExtractors = require('./featureExtractors');

var featureExtractors = _interopRequireWildcard(_featureExtractors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MeydaAnalyzer = function () {
	function MeydaAnalyzer(options, self) {
		_classCallCheck(this, MeydaAnalyzer);

		this._m = self;
		if (!options.audioContext) throw this._m._errors.noAC;else if (options.bufferSize && !utilities.isPowerOfTwo(options.bufferSize)) throw this._m._errors.notPow2;else if (!options.source) throw this._m._errors.noSource;

		this._m.audioContext = options.audioContext;

		// TODO: validate options
		this._m.bufferSize = options.bufferSize || self.bufferSize || 256;
		this._m.sampleRate = options.sampleRate || this._m.audioContext.sampleRate || 44100;
		this._m.callback = options.callback;
		this._m.windowingFunction = options.windowingFunction || "hanning";
		this._m.featureExtractors = featureExtractors;
		this._m.EXTRACTION_STARTED = options.startImmediately || false;

		this.setSource(options.source);

		//create nodes
		this._m.spn = this._m.audioContext.createScriptProcessor(this._m.bufferSize, 1, 1);
		this._m.spn.connect(this._m.audioContext.destination);

		this._m._featuresToExtract = options.featureExtractors || [];

		//always recalculate BS and MFB when a new Meyda analyzer is created.
		this._m.barkScale = utilities.createBarkScale(this._m.bufferSize, this._m.sampleRate, this._m.bufferSize);
		this._m.melFilterBank = utilities.createMelFilterBank(this._m.melBands, this._m.sampleRate, this._m.bufferSize);

		this._m.inputData = null;

		self = this;

		this.spn.onaudioprocess = function (e) {
			self._m.inputData = e.inputBuffer.getChannelData(0);

			var features = self._m.extract(self._m._featuresToExtract, self._m.inputData);

			// call callback if applicable
			if (typeof self._m.callback === "function" && self._m.EXTRACTION_STARTED) {
				self._m.callback(features);
			}
		};
	}

	_createClass(MeydaAnalyzer, [{
		key: 'start',
		value: function start(features) {
			this._m._featuresToExtract = features;
			this._m.EXTRACTION_STARTED = true;
		}
	}, {
		key: 'stop',
		value: function stop() {
			this._m.EXTRACTION_STARTED = false;
		}
	}, {
		key: 'setSource',
		value: function setSource(source) {
			source.connect(this._m.spn);
		}
	}, {
		key: 'get',
		value: function get(features) {
			if (this._m.inputData !== null) {
				return this._m.extract(features || this._m._featuresToExtract, this._m.inputData);
			} else {
				return null;
			}
		}
	}]);

	return MeydaAnalyzer;
}();

exports.default = MeydaAnalyzer;
module.exports = exports['default'];