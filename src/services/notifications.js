 // src/services/notifications.js
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';

export class NotificationService {
  static async checkAndSendReminders(userDetails) {
    const reminders = [];

    // Check document expiry
    if (userDetails.documents) {
      userDetails.documents.forEach(doc => {
        const expiryDate = parseISO(doc.expiry_date);
        const warningDate = addDays(new Date(), 30);

        if (isBefore(expiryDate, warningDate)) {
          reminders.push({
            type: 'document',
            title: `${doc.type} expiring soon`,
            message: `Your ${doc.type} will expire on ${doc.expiry_date}`,
            dueDate: doc.expiry_date
          });
        }
      });
    }

    // Check car wash schedule
    const lastWash = parseISO(userDetails.last_wash_date);
    const washDue = addDays(lastWash, 15);
    if (isAfter(new Date(), washDue)) {
      reminders.push({
        type: 'service',
        title: 'Car Wash Due',
        message: 'Your car is due for a wash',
        dueDate: washDue
      });
    }

    // Check loan payments
    if (userDetails.loan) {
      const nextEmiDate = parseISO(userDetails.loan.next_emi_date);
      const emiWarning = addDays(new Date(), 5);

      if (isBefore(nextEmiDate, emiWarning)) {
        reminders.push({
          type: 'loan',
          title: 'EMI Payment Due',
          message: `EMI payment of ₹${userDetails.loan.emi_amount} due on ${userDetails.loan.next_emi_date}`,
          dueDate: nextEmiDate
        });
      }
    }

    // Send notifications if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      reminders.forEach(reminder => {
        new Notification(reminder.title, {
          body: reminder.message,
          icon: '/icon.png'
        });
      });
    }

    return reminders;
  }

  static async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  static async scheduleReminders(reminders) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        reminders.forEach(reminder => {
          const triggerTime = new Date(reminder.dueDate).getTime();
          registration.showNotification(reminder.title, {
            body: reminder.message,
            icon: '/icon.png',
            tag: `reminder-${reminder.type}`,
            showTrigger: new TimestampTrigger(triggerTime)
          });
        });
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    }
  }
}

export default NotificationService;
