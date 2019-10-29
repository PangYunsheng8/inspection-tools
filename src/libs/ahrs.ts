import AHRS from 'ahrs'

export const ahrs = new AHRS({

  /*
   * The sample interval, in Hz.
   */
  sampleInterval: 50,

  /*
   * Choose from the `Madgwick` or `Mahony` filter.
   */
  algorithm: 'Mahony',

  /*
   * The filter noise value, smaller values have
   * smoother estimates, but have higher latency.
   * This only works for the `Madgwick` filter.
   */
  beta: 0.4,

  /*
   * The filter noise values for the `Mahony` filter.
   */
  kp: 0.00,
  ki: 0.00
}) as any
