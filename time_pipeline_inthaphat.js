/**
 * ============================================================
 * time_pipeline_inthaphat.js
 * ระบบท่อส่งเวลาขาเข้า (Time Input Pipeline) & ชำระอายันแปรผันดาว ๒ 
 * สำหรับดวงพิชัยสงครามและเครื่องยนต์อินทภาษบาทจันทร์ (Dynamic Version)
 * ============================================================
 */

window.AstroTimePipeline = (function () {
    'use strict';

    /**
     * 🧮 STEP 2: ฟังก์ชันคำนวณสมการเวลา (Equation of Time - EoT)
     * ชำระความเพี้ยนหน้าปัดนาฬิกาแดดจากวงโคจรวงรีของโลก (คืนค่าเป็นนาทีบวกลบ)
     */
    function calculateEoT(day, month) {
        const monthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        const dayOfYear = monthDays[month - 1] + day;
        // สูตรมุมกวาดของโลกตามอนุกรมฟูเรียร์ดาราศาตร์สากล
        const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
        return (9.87 * Math.sin(2 * b)) - (7.53 * Math.cos(b)) - (1.5 * Math.sin(b));
    }

    /**
     * ⚙️ ฟังก์ชันหลักในการประมวลผลชำระพิกัดเวลา (LMT -> EoT -> LAT)
     */
    function processInputTime(rawHour, rawMin, longitude, day, month) {
        let totalInputMinutes = (rawHour * 60) + rawMin;

        // [STEP 1: LMT] แปลงลองจิจูดเทียบกับเส้นแบ่งเวลามาตรฐาน 105 องศาตะวันออก
        let longitudeDiffMinutes = (longitude - 105.0) * 4;
        let lmtMinutes = totalInputMinutes + longitudeDiffMinutes;

        // [STEP 2: EoT] คำนวณหักลบสมการเวลาหาพิกัดแดดจริงสุริยคติแท้ (LAT)
        let eotOffset = calculateEoT(day, month);
        let latMinutes = lmtMinutes + eotOffset;

        return {
            lmtMinutes: lmtMinutes,
            latMinutes: latMinutes,
            eotOffset: eotOffset,
            finalHour: Math.floor(latMinutes / 60),
            finalMin: Math.floor(latMinutes % 60)
        };
    }

    /**
     * 🔮 STEP 3: ท่อดักชำระค่าอายันสะสมดาว ๒ (Moon Precession Fix)
     * คำนวณขยับพิกัดดาวจันทร์แปรผันอย่างอิสระตรงตามปี จุลศักราช (จ.ศ.) เกิดจริง ไม่มีการล็อกค่าตายตัว
     */
    function cleanseMoonCoordinates(moonRasi, moonDeg, moonLipda, chulaSakarat) {
        // ปีฐานคัมภีร์สุริยยาตร จ.ศ. 110 คลาดเคลื่อนสะสมปีละ ~0.2355 ลิปดา
        let calculatedOffset = Math.round((chulaSakarat - 110) * 0.2355);

        // แปลงพิกัดเดิมจากสุริยยาตร (เช่น ตกพิจิก) เป็นลิปดารวมสะสมนับจากหัวราศีเมษ (0° ราศีเมษ)
        let totalMoonLipda = (moonRasi * 1800) + (moonDeg * 60) + moonLipda;

        // บวกรวมค่าชำระอายันตางค์ประจำปีเกิดเข้าไปในกระดาน
        totalMoonLipda += calculatedOffset;
        totalMoonLipda = totalMoonLipda % 21600; // ล็อกรอบวงกลมจักรราศี (12 ราศี)

        // แตกพิกัดคืนกลับสู่ระบบโครงสร้าง ราศี, องศา, ลิปดา
        return {
            offsetMinutes: calculatedOffset,
            rasi: Math.floor(totalMoonLipda / 1800),
            deg: Math.floor((totalMoonLipda % 1800) / 60),
            lipda: Math.floor(totalMoonLipda % 60)
        };
    }

    return {
        processInputTime,
        cleanseMoonCoordinates
    };
})();
console.log('🌌 [Astro Time Pipeline Engine] พร้อมสวมต่อท่อไอดีเมนูที่สี่ 100%');
