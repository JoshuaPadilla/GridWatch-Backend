import {
  CRITICAL_CURRENT_UPPER_LIMIT,
  WARNING_CURRENT_UPPER_LIMIT,
} from 'src/constants/current_threshold.constant';
import {
  CRITICAL_VOLTAGE_LOWER_LIMIT,
  WARNING_VOLTAGE_LOWER_LIMIT,
} from 'src/constants/voltage_threshold.constant';
import { Device } from 'src/endpoints/device/schema/device.schema';
import { CreateNotificationDto } from 'src/endpoints/notification/dto/create-notification.dto';
import { Notification } from 'src/endpoints/notification/schema/notification.schema';
import { CreateSensorPayloadDto } from 'src/endpoints/sensor/dto/create-sensor-payload.dto';
import { SensorPayload } from 'src/endpoints/sensor/schema/sensor_payload.schema';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';
import { NOTIFICATION_STATUS } from 'src/enums/notification_status.enum';

export const getCriticalVoltageNotif = (
  device: Device,
  voltage: number,
): CreateNotificationDto => {
  return {
    deviceId: device.deviceId,
    title: 'Extremely Low Voltage Alert',
    body: `Critical: Voltage (${voltage}V) level is extremely low (<= ${CRITICAL_VOLTAGE_LOWER_LIMIT}V). It is possible to experience power interruption in ${device.locationName}.`,
    status: NOTIFICATION_STATUS.CRITICAL,
  };
};

export const getWarningVoltageNotif = (
  device: Device,
  voltage: number,
): CreateNotificationDto => {
  return {
    deviceId: device.deviceId,
    title: 'Low Voltage Alert',
    body: `Warning: Voltage (${voltage}V) level is significantly low (<= ${WARNING_VOLTAGE_LOWER_LIMIT}V). High risk of power instability/sag in ${device.locationName}.`,
    status: NOTIFICATION_STATUS.WARNING,
  };
};

export const getWarningCurrentNotfi = (
  device: Device,
  current: number,
): CreateNotificationDto => {
  return {
    deviceId: device.deviceId,
    title: 'High Current Alert',
    body: `Warning: Current (${current}A) is high (>= ${WARNING_CURRENT_UPPER_LIMIT}A). Monitor for potential overload stress. On grid located on ${device.locationName}.`,
    status: NOTIFICATION_STATUS.WARNING,
  };
};

export const getCriticalCurrentNotif = (
  device: Device,
  current: number,
): CreateNotificationDto => {
  return {
    deviceId: device.deviceId,
    title: 'High Current Alert',
    body: `Warning: Current (${current}A) is dangerously high (>= ${CRITICAL_CURRENT_UPPER_LIMIT}A). Potential device overload leading to blackout on grid located on ${device.locationName}.`,
    status: NOTIFICATION_STATUS.WARNING,
  };
};
