import { Notification } from '../models/Notification.model.js';

/**
 * Safe Notification Dispatcher
 */
export const sendNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '',
  metadata = {},
}) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      metadata,
    });
    await notification.save();
    return notification;
  } catch (error) {
    // Non-blocking error handling
    console.error('[Notification Service Error]', error.message);
    return null;
  }
};

