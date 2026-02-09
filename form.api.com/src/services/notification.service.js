import { Driver, Notification, Vendor } from "../startup/models.js";
import { sendNotificationsToOneSignalUser } from "./oneSignal.js";
import moment from "moment";

export const createOneSignalNotification = async ({
  type,
  userIds,
  userType,
  dateTime,
  data,
}) => {
  /**
   * Create OneSignal notification
   * @param {Object} params
   * @param {string} params.type - Type of the notification
   * @param {string[]} params.userIds - Array of userIds (either provider or user)
   * @param {string} params.userType - User type (user/provider)
   * @param {Date} [params.dateTime] - DateTime of the notification, defaults to now
   * @param {*} [params.data] - Additional data, can be null
   */
  const { title, subtitle } = getNotificationDetails(type);
  const notificationDateTime = dateTime || moment().toDate();

  await sendNotificationsToOneSignalUser(
    "multiple",
    userIds,
    userType,
    title,
    subtitle,
    notificationDateTime,
    data
  );
};

/**
 * Get notification details (title and subtitle) based on notification type
 * @param {string} type - Type of the notification
 * @returns {Object} - Object containing title and subtitle
 */
function getNotificationDetails(type) {
  switch (type) {
    case "order-placed":
      return {
        title: "Order Placed",
        subtitle: "Your order has been placed.",
      };
    case "order-preparing":
      return {
        title: "Order Preparing",
        subtitle: "Your order is being prepared.",
      };
    case "order-cancelled":
      return {
        title: "Order Cancelled",
        subtitle: "Your order request has been cancelled.",
      };
    case "order-request":
      return {
        title: "Order Request",
        subtitle: "A new order request has been received.",
      };
    case "out-for-delivery":
      return {
        title: "Out for Delivery",
        subtitle: "Your order is out for delivery.",
      };
    case "order-delivered":
      return {
        title: "Order Delivered",
        subtitle: "Your order has been successfully delivered.",
      };
    case "user-feedback":
      return {
        title: "User Feedback",
        subtitle: "Feedback has been received from the user.",
      };
    default:
      return {
        title: "Feeling Hungry?",
        subtitle: "Order something delicious now!",
      };
  }
}


export const createNotification = async (req, data) => {
  try {
    const io = req.app.locals.io;
    if (!io) {
      console.error("Socket.IO instance not found");
      // still record the notification(s) so nothing is lost
    }

    const {
      recipientType = "user",
      recipientId,
      recipientIds = [],
      ...rest
    } = data;

    let targets = [];
    if (recipientType === "all") {
      targets = ["all"];
    } else if (Array.isArray(recipientIds) && recipientIds.length) {
      targets = recipientIds.map(String);
    } else if (recipientId) {
      targets = [String(recipientId)];
    } else {
      throw new Error("No recipient specified");
    }

    const docsToInsert = targets.map(uid => ({
      ...rest,
      recipientType,
      recipientId: uid
    }));

    const notifications = await Notification.insertMany(docsToInsert);

    if (io) {
      io.to(targets).emit("newNotification", {
        notificationIds: notifications.map(n => n._id),
        type: rest.type,
        message: rest.message,
        recipientType,
        recipientIds: targets,
        isRead: false,
        createdAt: notifications[0].createdAt
      });

      console.log(`Notification emitted to rooms [${targets.join(", ")}]`);
    }

    return notifications; // ← array of created docs
  } catch (err) {
    console.error("Error creating notification:", err.message);
    throw err;
  }
};

