import dbConnect from '../src/lib/db';
import Enrollment from '../src/models/Enrollment';
import User from '../src/models/User';
import Course from '../src/models/Course';
import { getDaysRemaining, isExpired } from '../src/utils/date';

/**
 * Cron job to check for expired enrollments and send warnings
 * Run this daily using a cron scheduler or Vercel Cron
 */
async function checkExpiry() {
  try {
    await dbConnect();
    console.log('Checking for expired enrollments...');

    // Find all active enrollments with expiry dates
    const enrollments = await Enrollment.find({
      isActive: true,
      expiryDate: { $exists: true, $ne: null },
    })
      .populate('userId')
      .populate('courseId');

    let expiredCount = 0;
    let warningCount = 0;

    for (const enrollment of enrollments) {
      const expiryDate = new Date(enrollment.expiryDate);
      
      // Check if expired
      if (isExpired(expiryDate)) {
        enrollment.isActive = false;
        await enrollment.save();
        expiredCount++;
        
        console.log(`Deactivated enrollment for ${enrollment.userId.email} - ${enrollment.courseId.name}`);
        
        // TODO: Send expiry notification email
      } else {
        // Check if warning should be sent (7 days before expiry)
        const daysRemaining = getDaysRemaining(expiryDate);
        
        if (daysRemaining === 7) {
          warningCount++;
          console.log(`Warning needed for ${enrollment.userId.email} - ${daysRemaining} days remaining`);
          
          // TODO: Send expiry warning email
        }
      }
    }

    console.log(`Cron job completed:`);
    console.log(`- Expired enrollments deactivated: ${expiredCount}`);
    console.log(`- Expiry warnings to send: ${warningCount}`);
    
    return {
      success: true,
      expiredCount,
      warningCount,
    };
  } catch (error) {
    console.error('Error in cron job:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run if executed directly
if (require.main === module) {
  checkExpiry()
    .then(() => {
      console.log('Cron job finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cron job failed:', error);
      process.exit(1);
    });
}

export default checkExpiry;
