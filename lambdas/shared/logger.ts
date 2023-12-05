/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 */

// Imports
import { Error, Info } from "./types";

class Logger {
  /**
   * Constructor
   */
  constructor() {}

  /**
   * Private method that build the logging message
   * @param {Info} info the object with the details to be logged
   */
  private buildMessage(info: Info): string {
    let msg = `====== service:"[${info.service}]" ====== operation:${info.operation} ====== message:${info.message}`;
    return msg;
  }

  /**
   * Private method that uses console logger to log message using `warn` level
   *  @param {Error} error the object with the error to be logged
   */
  private logError(error: Error): void {
    let msg = this.buildMessage(error);
    console.error(msg, error);
  }

  /**
   * Private method that uses console logger to log message using `warn` level
   * @param {Info} info the object with the details to be logged
   */
  private logWarn(info: Info): void {
    let msg = this.buildMessage(info);
    console.warn(msg, info);
  }

  /**
   * Private method that uses console logger to log message using `debug` level
   * @param {Info} info the object with the details to be logged
   */

  private logDebug(info: Info): void {
    let msg = this.buildMessage(info);
    console.debug(msg, info);
  }

  /**
   * Private method that uses console logger to log message using `info` level
   * @param {Info} info the object with the details to be logged
   */
  private logInfo(info: Info): void {
    let msg = this.buildMessage(info);
    console.info(msg, info);
  }

  /**
   * Log message using `info` level
   *  @param {Info} info the object with the details to be logged
   */
  public info(info: Info): void {
    this.logInfo(info);
  }

  /**
   * Log message using `debug` level
   * @param {Info} info the object with the details to be logged
   */
  public debug(info: Info): void {
    this.logDebug(info);
  }

  /**
   * Log message using `warn` level
   * @param {Info} info the object with the details to be logged
   */
  public warn(info: Info): void {
    this.logWarn(info);
  }

  /**
   * Log message using `error` level
   * @param {string} text log message
   * @param {Error} error the object with the error to be logged
   */
  public error(error: Error): void {
    this.logError(error);
  }
}

export { Logger };

