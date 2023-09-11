/* eslint-disable max-classes-per-file */

import { StrictUnion } from "@/components/create-encounter-component";
import { ValueOf } from "@/shared-types";

// Based on https://github.com/ronkot/ks-guitar-synth

const STRING_FREQUENCIES = {
   E2: 82.41,
   A2: 110.0,
   D3: 146.83,
   G3: 196.0,
   B3: 246.94,
   E4: 329.63
};

export const CHORD = {
   C: [ , 3, 2, 0, 1, 0],
   C7: [ , 3, 2, 0, 3, 0],
   Cm: [ , 3, 5, 5, 4, 3],
   Cm7: [ , 3, 5, 3, 5, 3],

   Cs: [ , 4, 6, 6, 6, 4],
   Cs7: [ , 4, 6, 4, 6, 4],
   Csm: [ , 4, 6, 6, 5, 4],
   Csm7: [ , 4, 6, 4, 5, 4],

   D: [ , , 0, 2, 3, 2],
   D7: [ , , 0, 2, 1, 2],
   Dm: [ , , 0, 2, 3, 1],
   Dm7: [ , , 0, 2, 1, 1],

   Ds: [ , 6, 8, 8, 8, 6],
   Ds7: [ , 6, 8, 6, 8, 6],
   Dsm: [ , 6, 8, 8, 7, 6],
   Dsm7: [ , 6, 8, 6, 7, 6],

   E: [0, 2, 2, 1, 0, 0],
   E7: [0, 2, 0, 1, 3, 0],
   Em: [0, 2, 2, 0, 0, 0],
   Em7: [0, 2, 2, 0, 3, 0],

   F: [1, 3, 3, 2, 1, 1],
   F7: [1, 3, 1, 2, 1, 1],
   Fm: [1, 3, 3, 1, 1, 1],
   Fm7: [1, 3, 3, 1, 4, 1],

   Fs: [2, 4, 4, 3, 2, 2],
   Fs7: [2, 4, 2, 3, 2, 2],
   Fsm: [2, 4, 4, 2, 2, 2],
   Fsm7: [2, 4, 4, 2, 5, 2],

   G: [3, 2, 0, 0, 0, 3],
   G7: [3, 2, 0, 0, 0, 1],
   Gm: [3, 5, 5, 3, 3, 3],
   Gm7: [3, 5, 5, 3, 6, 3],

   Gs: [4, 6, 6, 5, 4, 4],
   Gs7: [4, 6, 4, 5, 4, 4],
   Gsm: [4, 6, 6, 4, 4, 4],
   Gsm7: [4, 6, 6, 4, 7, 4],

   A: [ , 0, 2, 2, 2, 0],
   A7: [ , 0, 2, 0, 2, 0],
   Am: [ , 0, 2, 2, 1, 0],
   Am7: [ , 0, 2, 0, 1, 0],

   As: [6, 8, 8, 7, 6, 6],
   As7: [6, 8, 6, 7, 6, 6],
   Asm: [6, 8, 8, 6, 6, 6],
   Asm7: [6, 8, 8, 6, 9, 6],

   B: [ , 2, 4, 4, 4, 2],
   B7: [ , 2, 4, 2, 4, 2],
   Bm: [ , 2, 4, 4, 3, 2],
   Bm7: [ , 2, 4, 0, 3, 2],

   mute: [ , , , , , ]
};

const workletInit = function() {

   type LowPassFn = (v: number) => number;
   function makeLowPass(smoothingFactor: number = 0.1): LowPassFn {
      let last: number | undefined;

      return (v) => {
         const output = last === undefined ? v : (smoothingFactor * v + (1 - smoothingFactor) * last);

         last = output;
         return output;
      };
   }

   globalThis.registerProcessor('ks', class WorkletProcessor extends AudioWorkletProcessor {
      private _buffer: Float32Array;
      private _bufferPtr: number = 0;
      private _outputLowPass: LowPassFn = makeLowPass(0.2);

      constructor (opts: AudioWorkletNodeOptions) {
         super();

         this._buffer = new Float32Array(Math.round(globalThis.sampleRate / (opts.processorOptions.freq || 440)));

         const randomLowPass = makeLowPass(0.4);

         for (let i = 0; i < this._buffer.length; i++) {
            this._buffer[i] = randomLowPass(Math.random() * 1.4 - 0.7);
         }
      }

      process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
         const bufferLength = this._buffer.length;

         for (let i = 0; i < outputs[0][0].length; i++) {
            const sample1 = this._buffer[(this._bufferPtr - 1 + bufferLength) % bufferLength],
                  sample2 = this._buffer[(this._bufferPtr + bufferLength) % bufferLength],
                  value = (sample1 + sample2) / 2;

            outputs[0][0][i] = this._outputLowPass(value);
            this._buffer[this._bufferPtr] = value;
            this._bufferPtr = (this._bufferPtr + 1) % bufferLength;
         }

         return true;
      }
   });

};

const worklet = URL.createObjectURL(new Blob([ '(', workletInit.toString(), ')()' ], { type: 'application/javascript' }));

export class GuitarString {

   private _karplusStrongNode?: AudioWorkletNode = undefined;

   public constructor(private _stringFrequency: number, private _audioContext: AudioContext, private _outputNode: AudioNode) {}

   public async pluck(fret = 0): Promise<void> {
      if (fret < 0) {
         return;
      }

      if (this._karplusStrongNode) {
         this._karplusStrongNode.disconnect();
      }

      const frequency = this._stringFrequency * 2 ** (fret / 12);

      this._karplusStrongNode = new AudioWorkletNode(this._audioContext, 'ks', { processorOptions: { freq: frequency } });
      this._karplusStrongNode.connect(this._outputNode);
   }

}

export class Guitar {

   private _gainNode: GainNode;
   private _workletModuleLoading: Promise<void>;
   private _strings: GuitarString[];

   public constructor(private _audioContext: AudioContext) {
      this._workletModuleLoading = this._audioContext.audioWorklet.addModule(worklet);

      this._gainNode = this._audioContext.createGain();
      this._gainNode.connect(this._audioContext.destination);

      this._strings = [
         new GuitarString(STRING_FREQUENCIES.E2, this._audioContext, this._gainNode),
         new GuitarString(STRING_FREQUENCIES.A2, this._audioContext, this._gainNode),
         new GuitarString(STRING_FREQUENCIES.D3, this._audioContext, this._gainNode),
         new GuitarString(STRING_FREQUENCIES.G3, this._audioContext, this._gainNode),
         new GuitarString(STRING_FREQUENCIES.B3, this._audioContext, this._gainNode),
         new GuitarString(STRING_FREQUENCIES.E4, this._audioContext, this._gainNode),
      ];
   }

   public async strum(chord: (number | undefined)[], strumDuration = 0.05): Promise<void> {
      await this._workletModuleLoading;
      this._gainNode.gain.value = 0.1;
      chord.reduce((plucked: number, fret, i) => {
         if (fret === undefined) {
            return plucked;
         }

         setTimeout(() => {
            this._strings[i].pluck(fret);
         }, Math.floor(plucked * strumDuration * 1000 / 6));

         return plucked + 1;
      }, 0);
   }

   public async pluck(string: number, fret: number): Promise<void> {
      await this._workletModuleLoading;
      this._gainNode.gain.value = 0.1;
      this._strings[string].pluck(fret);
   }

   public mute() {
      this._gainNode.gain.linearRampToValueAtTime(0, this._audioContext.currentTime + 0.001);
   }

}

type SequencerStep = StrictUnion<
   {
      strum: ValueOf<typeof CHORD>;
      speed?: number;
   }
   | {
      pluck: (number | undefined)[];
   }
>;

export class Sequencer {

   private _guitar: Guitar;
   private _pointer: number = 0;
   private _timer: number | undefined = undefined;

   public constructor(audioContext: AudioContext, private _pattern: (SequencerStep | undefined)[], private _bpm: number) {
      this._guitar = new Guitar(audioContext);
   }

   public play(): void {
      this._timer = setInterval(this.process.bind(this), 60 / this._bpm * 1000);
   }

   public stop(): void {
      if (this._timer !== undefined) {
         this._guitar.mute();
         clearInterval(this._timer);
      }
   }

   private process(): void {
      const step = this._pattern[this._pointer];

      if (step?.strum) {
         this._guitar.strum(step.strum, step.speed);
      } else if (step?.pluck) {
         step.pluck.forEach((fret, i) => {
            if (fret === undefined) {
               return;
            }

            this._guitar.pluck(i, fret);
         });
      }

      this._pointer = (this._pointer + 1) % this._pattern.length;
   }

}
