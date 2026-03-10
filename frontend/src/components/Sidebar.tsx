"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Brain,
    Users,
    Bell,
    ChevronDown,
    ChevronRight,
    BookOpen,
    Landmark,
    BookMarked,
    Building2,
    CreditCard,
    BarChart3,
    Settings,
    TrendingUp,
    ShoppingCart,
    PackageSearch,
    Boxes,
    LogOut,
    User,
    Shield,
    X,
    Sparkles,
} from "lucide-react";
import Logo from "./Logo";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DashboardIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 122.88 121.92"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M6.6,121.92H47.51a6.56,6.56,0,0,0,2.83-.64,6.68,6.68,0,0,0,2.27-1.79,6.63,6.63,0,0,0,1.5-4.17V74.58A6.56,6.56,0,0,0,53.58,72,6.62,6.62,0,0,0,50,68.47,6.56,6.56,0,0,0,47.51,68H6.6a6.5,6.5,0,0,0-2.43.48,6.44,6.44,0,0,0-2.11,1.34A6.6,6.6,0,0,0,.55,72,6.3,6.3,0,0,0,0,74.58v40.74a6.54,6.54,0,0,0,.43,2.32,6.72,6.72,0,0,0,1.2,2l.26.27a6.88,6.88,0,0,0,2,1.39,6.71,6.71,0,0,0,2.73.6ZM59.3,28.44,86,1.77A6.19,6.19,0,0,1,88.22.34,6.24,6.24,0,0,1,90.87,0a6,6,0,0,1,3.69,1.74l26.55,26.55a6,6,0,0,1,1.33,2,6.13,6.13,0,0,1-1.33,6.58L94.45,63.58a6,6,0,0,1-1.9,1.27,5.92,5.92,0,0,1-2.24.5,6.11,6.11,0,0,1-2.41-.43,5.74,5.74,0,0,1-2.05-1.34L59.3,37a6.09,6.09,0,0,1-1.76-3.88V32.8a6.14,6.14,0,0,1,1.77-4.36ZM6.6,59.64H47.51a6.56,6.56,0,0,0,5.1-2.43,6.46,6.46,0,0,0,1.11-2,6.59,6.59,0,0,0,.39-2.21V12.31a6.61,6.61,0,0,0-.53-2.58A6.62,6.62,0,0,0,50,6.19a6.56,6.56,0,0,0-2.45-.48H6.6a6.5,6.5,0,0,0-2.43.48A6.44,6.44,0,0,0,2.06,7.53,6.6,6.6,0,0,0,.55,9.71,6.31,6.31,0,0,0,0,12.31V53.05a6.48,6.48,0,0,0,.43,2.31,6.6,6.6,0,0,0,1.2,2l.26.27a6.88,6.88,0,0,0,2,1.39,6.71,6.71,0,0,0,2.73.6Zm40.92-6.57H6.6l0,0V12.28c3.51,0,40.93,0,41,0,0,3.44,0,40.75,0,40.77Zm22.23,68.85h40.91a6.56,6.56,0,0,0,2.83-.64,6.68,6.68,0,0,0,2.27-1.79,6.63,6.63,0,0,0,1.5-4.17V74.58a6.56,6.56,0,0,0-.53-2.57,6.62,6.62,0,0,0-3.62-3.54,6.56,6.56,0,0,0-2.45-.48H69.75a6.75,6.75,0,0,0-4.54,1.82A6.6,6.6,0,0,0,63.7,72a6.3,6.3,0,0,0-.55,2.59v40.74a6.54,6.54,0,0,0,.43,2.32,6.72,6.72,0,0,0,1.2,2l.26.27a6.88,6.88,0,0,0,2,1.39,6.71,6.71,0,0,0,2.73.6Zm40.92-6.57H69.75l0,0,0-40.77c3.51,0,40.93,0,41,0,0,3.44,0,40.75,0,40.77Zm-63.15,0H6.6l0,0V74.56c3.51,0,40.93,0,41,0,0,3.44,0,40.75,0,40.77Z" />
    </svg>
);

const CasesIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 122.88 99.28"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path fillRule="evenodd" clipRule="evenodd" d="M9.49,38.43c0.3-1.86,0.93-3.47,1.9-4.83c19.47-13.53,84.23-12.38,100.19,0c1.84,2.36,2.64,5.96,2.93,10.17 l8.28,45.01c0.71,6.59-2.55,10.3-11.36,10.5H7.96c-5.45-1.53-8.14-4.6-7.96-9.64L9.49,38.43L9.49,38.43z M46.39,0H76.8 c4.59,0,8.35,3.76,8.35,8.35v12.99l-9.44-1.07V9.22H47.18v11.05l-9.14,2.05V8.35C38.04,3.76,41.8,0,46.39,0L46.39,0z M35.43,50.03 h52.01c0.99,0,1.88,0.4,2.53,1.05c0.65,0.65,1.05,1.55,1.05,2.53v14.22c0,0.03,0,0.07,0,0.1c0,0.03,0,0.07,0,0.1v14.22 c0,0.99-0.4,1.88-1.05,2.53c-0.65,0.65-1.55,1.05-2.53,1.05H35.43c-0.99,0-1.88-0.4-2.53-1.05c-0.65-0.65-1.05-1.54-1.05-2.53 V68.03c0-0.03,0-0.07,0-0.1c0-0.03,0-0.07,0-0.1V53.61c0-0.99,0.4-1.88,1.05-2.53C33.55,50.43,34.45,50.03,35.43,50.03L35.43,50.03 z M34.74,66.48h53.39v-12.1c0-0.19-0.08-0.36-0.2-0.49c-0.13-0.13-0.3-0.2-0.49-0.2H35.43c-0.19,0-0.36,0.08-0.49,0.2 c-0.13,0.13-0.2,0.3-0.2,0.49V66.48L34.74,66.48z M88.14,70.15H34.74v11.33c0,0.19,0.08,0.36,0.2,0.49c0.13,0.13,0.3,0.2,0.49,0.2 h52.01c0.19,0,0.36-0.08,0.49-0.2c0.13-0.13,0.2-0.3,0.2-0.49V70.15L88.14,70.15z M59,57.74h4.89v4.12H59V57.74L59,57.74z M61.44,30.61c2.4,0,4.35,1.95,4.35,4.35c0,2.4-1.95,4.35-4.35,4.35c-2.4,0-4.35-1.95-4.35-4.35 C57.09,32.56,59.04,30.61,61.44,30.61L61.44,30.61z" />
    </svg>
);

const InvoiceIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 122.879 94.035"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g>
            <path fillRule="evenodd" clipRule="evenodd" d="M7.272,8.754h7.181V0h41.954v8.754h59.167v11.708L7.272,15.257V8.754L7.272,8.754 z M57.741,34.997c5.626,0,10.73,2.289,14.425,5.97c3.695,3.696,5.971,8.784,5.971,14.425c0,4.115-1.227,7.961-3.322,11.164 l8.83,9.621l-6.092,5.567l-8.514-9.368c-3.232,2.155-7.124,3.412-11.298,3.412c-5.626,0-10.729-2.289-14.426-5.971 c-3.696-3.696-5.971-8.784-5.971-14.426c0-5.626,2.29-10.729,5.971-14.425C47.011,37.271,52.099,34.997,57.741,34.997 L57.741,34.997z M69.475,43.659c-3.002-3.002-7.154-4.867-11.734-4.867c-4.579,0-8.732,1.864-11.734,4.867 c-3.002,3.002-4.867,7.156-4.867,11.734c0,4.579,1.865,8.732,4.867,11.734c3.002,3.003,7.156,4.867,11.734,4.867 c4.58,0,8.732-1.864,11.734-4.867c3.002-3.002,4.867-7.155,4.867-11.734C74.342,50.814,72.477,46.661,69.475,43.659L69.475,43.659 L69.475,43.659z M0,21.613h122.879l-9.072,66.698c-0.424,3.112-2.586,5.724-5.727,5.724H12.735c-3.145,0-5.401-2.594-5.73-5.729 L0,21.613L0,21.613z" />
        </g>
    </svg>
);

const ExpensesIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 88.47 122.88"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g>
            <path d="M11.86,68.08L7.62,92.09c-0.07,0.33-0.2,0.63-0.4,0.86c-1.51,1.95-2.46,3.62-2.74,4.97c-0.2,1,0,1.8,0.67,2.43l16.56,16.56 c1.05,1.01,2.28,1.65,3.74,1.91c1.6,0.3,3.46,0.13,5.6-0.45c0.03,0,0.08-0.02,0.12-0.02c0.81-0.22,1.88-0.48,2.89-0.73 c4.44-1.08,8.31-2.03,11.91-5.29l4.62-4.82c0.05-0.08,0.12-0.15,0.18-0.22c0.07-0.07,0.52-0.52,1.13-1.13c3.16-3.09,7.07-6.9,4.69-10.24l-1.85-1.85c-0.9,0.86-1.85,1.71-2.76,2.53c-0.83,0.73-1.61,1.41-2.33,2.13 c-0.76,0.76-2,0.76-2.76,0c-0.76-0.77-0.76-2,0-2.76c0.71-0.72,1.6-1.5,2.51-2.31c3.13-2.76,6.72-5.92,4.79-8.68l-1.83-1.83 c-0.1-0.1-0.18-0.22-0.27-0.33c-1.05,1.08-2.21,2.11-3.34,3.11c-0.83,0.73-1.61,1.41-2.33,2.13c-0.77,0.77-2,0.77-2.76,0 c-0.77-0.76-0.77-2,0-2.76c0.71-0.71,1.6-1.5,2.51-2.31c3.13-2.76,6.72-5.92,4.79-8.68l-1.83-1.83c-0.13-0.13-0.23-0.27-0.32-0.42 l-5.37,5.37c-0.77,0.76-2,0.76-2.76,0c-0.76-0.77-0.76-2,0-2.76l10.07-10.07c2.41-2.41,2.96-4.92,2.33-6.82 c-0.23-0.7-0.62-1.31-1.1-1.8c-0.25-0.25-0.53-0.47-0.84-0.66l-0.01,0c-0.15,0.07-0.26-0.08-0.4-0.22 c-0.17-0.08-0.36-0.16-0.54-0.22c-1.67-0.55-3.84-0.16-6.04,1.69c-0.03,0.03-0.06,0.06-0.09,0.08c-0.24,0.2-0.48,0.42-0.72,0.66 L22.44,78.27c-0.76,0.76-2,0.76-2.76,0c-0.7-0.7-0.76-1.78-0.18-2.55L11.86,68.08L11.86,68.08z M25.08,70.11l0.67-0.67l13.79-13.79 c-1.43-0.66-2.76-1.59-3.94-2.77c-5.25-5.25-5.25-13.73,0-18.98c5.25-5.25,13.73-5.25,18.98,0c5.25,5.25,5.25,13.73,0,18.98 c-0.04,0.04-0.09,0.09-0.13,0.13c0.1,0.09,0.21,0.19,0.31,0.29c0.43,0.43,0.8,0.9,1.13,1.4l17.1-17.1c-2.62-2.62-2.62-6.9,0-9.53 L60.25,15.33c-2.62,2.62-6.9,2.62-9.53,0L15.28,50.77c2.62,2.62,2.62,6.9,0,9.53L25.08,70.11L25.08,70.11z M55.14,65.57 c-0.46,0.64-0.99,1.28-1.62,1.9l-2,2l-0.02-0.05c0.15,0.08,0.28,0.18,0.42,0.32l1.91,1.91c0.1,0.1,0.2,0.23,0.28,0.35 c2.15,2.94,1.81,5.57,0.35,7.97c0.27,0.1,0.52,0.25,0.71,0.45l1.91,1.91c0.1,0.1,0.2,0.23,0.28,0.35c2.31,3.18,1.73,5.95,0,8.48 c0.08,0.05,0.15,0.12,0.23,0.2l1.91,1.91c0.1,0.1,0.2,0.23,0.28,0.35c4.44,6.07-0.85,11.22-5.1,15.38l-1.1,1.1l-4.74,4.97 l-0.15,0.15c-4.34,3.94-8.65,4.99-13.62,6.2c-0.83,0.2-1.68,0.42-2.84,0.71c-0.03,0-0.05,0.02-0.08,0.02 c-2.69,0.73-5.14,0.91-7.33,0.52c-2.23-0.4-4.16-1.4-5.77-2.98L2.52,103.15c-1.68-1.61-2.24-3.61-1.78-5.97 c0.37-1.9,1.46-3.99,3.19-6.25l4.42-25.04v-0.1c0.04-0.31,0.1-0.66,0.17-1.04L0,56.23L56.23,0l32.24,32.24L55.14,65.57L55.14,65.57 z" />
        </g>
    </svg>
);

const BankIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 122.88 108.91"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g>
            <path fillRule="evenodd" clipRule="evenodd" d="M2.79,41.59L61.44,0l58.95,41.59L2.79,41.59L2.79,41.59z M0,102.28h9.08v-6.33h1.32v-3.02l3.85,0V56.7H6.38 v-8.68h110.11v8.68h-7.86v36.23h3.85v3.02l1.32,0v6.33h9.08v6.63H0V102.28L0,102.28z M32.59,95.95h4.44v-3.02l3.85,0V56.7H28.74 v36.23h3.85V95.95L32.59,95.95L32.59,95.95z M59.22,95.95h4.45v-3.02l3.84,0V56.7H55.37v36.23h3.85V95.95L59.22,95.95L59.22,95.95z M85.85,95.95h4.45v-3.02l3.85,0V56.7H82v36.23h3.85V95.95L85.85,95.95L85.85,95.95z M41.69,31.1l19.84-15.22L81.48,31.1H41.69 L41.69,31.1z" />
        </g>
    </svg>
);

const GstIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 86.53 122.88"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g>
            <path fillRule="evenodd" clipRule="evenodd" d="M64.94,23.79c-3.03-1.49-6.62-1.82-10.06-0.64c-3.44,1.18-6.08,3.64-7.57,6.67 c-1.49,3.03-1.82,6.62-0.64,10.06c1.18,3.44,3.64,6.08,6.67,7.57c3.03,1.49,6.62,1.82,10.06,0.64c3.44-1.18,6.08-3.64,7.57-6.67 c1.48-3.03,1.82-6.62,0.64-10.06C70.43,27.92,67.97,25.28,64.94,23.79L64.94,23.79L64.94,23.79z M20.7,25.5l0.24,1.44 c0.96-0.06,1.81,0,2.54,0.18c0.73,0.18,1.39,0.53,2,1.04c0.47,0.39,0.86,0.8,1.16,1.24c0.3,0.44,0.48,0.86,0.54,1.26 c0.07,0.44-0.03,0.86-0.3,1.23c-0.27,0.38-0.64,0.6-1.1,0.68c-0.87,0.14-1.52-0.24-1.92-1.13c-0.48-1.06-1.3-1.68-2.48-1.86 l0.91,5.53c1.15,0.12,2.07,0.25,2.76,0.39c0.69,0.14,1.34,0.4,1.93,0.79c0.63,0.4,1.15,0.91,1.56,1.54 c0.41,0.63,0.68,1.35,0.81,2.15c0.17,1.01,0.09,1.99-0.25,2.95c-0.33,0.96-0.91,1.79-1.74,2.51c-0.83,0.71-1.87,1.22-3.13,1.53 l0.54,3.31c0.09,0.52,0.1,0.91,0.03,1.17c-0.06,0.26-0.26,0.41-0.61,0.47c-0.32,0.05-0.56-0.01-0.72-0.18 c-0.16-0.17-0.27-0.47-0.34-0.88l-0.59-3.59c-1.05,0.06-2-0.04-2.84-0.28c-0.84-0.24-1.56-0.6-2.17-1.07 c-0.61-0.47-1.09-0.99-1.43-1.54c-0.35-0.56-0.57-1.13-0.66-1.7c-0.07-0.42,0.03-0.83,0.31-1.23c0.28-0.39,0.66-0.63,1.15-0.72 c0.4-0.07,0.75-0.03,1.06,0.11c0.3,0.14,0.54,0.37,0.7,0.69c0.36,0.69,0.66,1.21,0.9,1.57c0.24,0.36,0.57,0.67,0.98,0.92 c0.41,0.26,0.93,0.43,1.55,0.5l-1.02-6.18c-1.24-0.14-2.29-0.34-3.16-0.61c-0.86-0.27-1.61-0.74-2.22-1.4 c-0.62-0.66-1.02-1.58-1.22-2.75c-0.25-1.52,0.03-2.86,0.84-3.99c0.81-1.13,2.12-1.93,3.93-2.39l-0.23-1.41 c-0.12-0.74,0.1-1.16,0.66-1.25C20.24,24.46,20.58,24.78,20.7,25.5L20.7,25.5z M20.51,34.9l-0.84-5.09 c-0.71,0.34-1.24,0.73-1.6,1.16c-0.36,0.43-0.48,1.02-0.35,1.75c0.11,0.7,0.4,1.2,0.85,1.49C19.02,34.51,19.66,34.74,20.51,34.9 L20.51,34.9z M22.85,38.57l0.96,5.82c0.86-0.32,1.5-0.8,1.9-1.42c0.4-0.62,0.54-1.29,0.42-2.01c-0.13-0.77-0.46-1.33-1.01-1.67 C24.57,38.95,23.81,38.71,22.85,38.57L22.85,38.57z M13.35,10.27c-1.23-2.31-2.39-4.67-3.43-7.08C11.85,0.22,21-0.93,23.98,0.84 L22.5,6.99c1.02-1.93,1.34-2.7,1.96-3.78c0.36,0.16,0.71,0.35,1.04,0.56c0.79,0.51,1.52,1.1,1.8,2.04 c0.18,0.61,0.11,1.27-0.34,2.01l-4.49,7.39c-0.73,0-1.46-0.06-2.18-0.19c0.19-0.79,0.44-1.67,0.63-2.47l-1.66,2.52 c-2.18-0.1-3.83,0.45-5.27,1.54l-6.75-5.84c-0.4-0.35-0.62-0.73-0.68-1.13C6.3,8.02,8.5,6.21,9.69,5.46L13.35,10.27L13.35,10.27z M22.59,21.3l-1.93-4.85c4.86,0.1,13.98,8.44,17.14,12.4c1.61,2.02,3.11,4.29,4.45,6.88c1.69,3.73,2.14,7.5,0.82,10.52 c8.56,1.41,12.89,6.26,16.31,10.12c1.31,1.47,2.93,4.72,5.18,4.31c4.23-0.76,16.87-1.46,18.11-1.9l3.86,11.12 c-3.67,1.13-25.92,4.67-28.14,3.95c-3.82-1.47-6.09-3.4-8.06-5.38l-7.32,10.95c2.24,1.35,4.48,2.39,6.6,3.38l0,0 c7.44,3.47,13.56,6.33,14.89,18.15c0.12,1.04,0.15,2.07,0.13,3.12c-0.01,1.06-0.07,2.02-0.12,3.02l0,0.03 c-0.02,0.33-0.04,0.68-0.07,1.37l-0.33,9.91l-14.78,0.04c0.27-8.49,0.22-3.68,0.22-12.14c0.06-1.13,0.12-2.18,0.06-3.13 c-0.05-0.84-0.2-1.62-0.53-2.34l-0.1-0.23c-0.36-0.78-0.68-1.5-0.93-1.62c-1.16-0.54-3.05-1.23-5.23-1.94 c-2.18-0.72-4.56-1.44-6.73-2.06c-3.89,12.7-3.91,15.99-10.04,27.8l-15.55,0.09c5.96-14.65,6.73-20.11,11.32-35.26 c-6.49-9.25,4.51-15.32,6.82-27.27c-1.96-0.18-6.76-0.27-10.9,0.93c-5.16,1.49-8.97,4.14-12.13,8.32L0,59.18 c0.34-0.04,0.99-1.23,7.23-4.67C5.9,53.95,4.78,53.09,4,51.8c-4.71-7.9-0.28-18.95,4.26-26.02c0.6-0.93,1.23-1.81,1.9-2.63 c1.73-2.11,3.56-4.58,6.01-5.88l-1.74,5.09l2.85-5.43l1.92-0.32L22.59,21.3L22.59,21.3z" />
        </g>
    </svg>
);

const navGroups = [
    {
        title: "dashboard",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
            { href: "/cases", label: "Cases", icon: CasesIcon },
        ]
    },
    {
        title: "FINANCE",
        items: [
            { href: "/invoices", label: "Invoices", icon: InvoiceIcon },
            { href: "/expenses", label: "Expenses", icon: ExpensesIcon },

            { href: "/bills", label: "Bills & Payables", icon: CreditCard },
            { href: "/bank-reconciliation", label: "Bank Reconciliation", icon: BankIcon },
            { href: "/gst-compliance", label: "GST & Tax", icon: GstIcon },
        ]
    },
    {
        title: "STRATEGY",
        items: [
            { href: "/cash-forecast", label: "Cash Forecast", icon: TrendingUp },
            { href: "/ai-reports", label: "Intelligence", icon: Brain },
            { href: "/reports", label: "Performance", icon: BarChart3 },
        ]
    },
    {
        title: "settings",
        items: [
            { href: "/settings", label: "Firm Settings", icon: Settings },
            { href: "/team", label: "Team Settings", icon: Users },


        ]
    },
];

interface SidebarProps {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity duration-500 md:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsOpen?.(false)}
            />

            <aside
                className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white border-r border-gray-100/50 shadow-2xl md:shadow-none lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
                style={{
                    width: "260px",
                }}
            >
                {/* Brand Header */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3.5 px-1">
                            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 shadow-sm border border-[#ee2a7b]/10">
                                <Logo size={24} showText={false} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black tracking-tight text-gray-900 leading-none">SOLV PROD</span>

                            </div>
                        </div>

                        {/* Close button for mobile */}
                        <button
                            className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            onClick={() => setIsOpen?.(false)}
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Navigation Scroll Area */}
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                    {navGroups.map((group, gIdx) => (
                        <div key={group.title} className={gIdx !== 0 ? "mt-8" : ""}>
                            <h3 className="px-3.5 mb-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] relative flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                {group.title}
                            </h3>
                            <nav className="flex flex-col gap-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen?.(false)}
                                            className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-300 overflow-hidden ${isActive
                                                ? "bg-white text-[#ee2a7b] shadow-[0_4px_16px_-4px_rgba(238,42,123,0.15),0_1px_2px_rgba(0,0,0,0.02)] border border-[#ee2a7b]/10 font-bold"
                                                : "text-slate-500 hover:text-[#6228d7] border border-transparent"
                                                }`}
                                        >
                                            {/* Hover Gradient Background */}
                                            {!isActive && (
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#f9ce34]/5 via-[#ee2a7b]/5 to-[#6228d7]/5 transition-all duration-500" />
                                            )}

                                            {/* Active Indicator bar */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeSideBarRef"
                                                    className="absolute left-0 w-1 h-5 rounded-r-full shadow-[0_0_12px_rgba(238,42,123,0.4)]"
                                                    style={{ background: "linear-gradient(to bottom, #f9ce34, #ee2a7b, #6228d7)" }}
                                                    initial={{ opacity: 0, scaleY: 0.5 }}
                                                    animate={{ opacity: 1, scaleY: 1 }}
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                />
                                            )}

                                            <div className="relative z-10">
                                                <item.icon
                                                    size={16}
                                                    strokeWidth={isActive ? 2.5 : 2}
                                                    className={`transition-all duration-200 ${isActive ? "text-[#ee2a7b]" : "text-slate-400 group-hover:text-[#6228d7] group-hover:scale-110"}`}
                                                />
                                                {item.label === "Notifications" && (
                                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                                )}
                                            </div>
                                            <span className="relative z-10 font-medium">{item.label}</span>

                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="ml-auto w-1 h-1 rounded-full bg-[#ee2a7b] shadow-[0_0_8px_rgba(238,42,123,0.5)]"
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Account Switcher Footer */}
                <div className="p-4 mt-auto">
                    <div className="p-4 rounded-[1.5rem] bg-gray-50/50 border border-gray-100 group transition-all hover:bg-white hover:shadow-premium relative">
                        {isProfileOpen && (
                            <div className="absolute bottom-[calc(100%+8px)] left-0 w-full p-2 bg-white rounded-2xl shadow-premium border border-gray-100/50 animate-in slide-in-from-bottom-2 duration-300 z-[60]">
                                <div className="p-3 border-b border-gray-50 mb-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center font-black shadow-lg">
                                            {user?.name ? getInitials(user.name) : "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tighter">{user?.name || "Member"}</p>
                                            <p className="text-[10px] font-medium text-gray-500 truncate">{user?.email || "verified@solvprod"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all font-bold group/btn">
                                        <User size={14} className="group-hover/btn:text-gray-900" /> My Profile
                                    </button>
                                    <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-all font-bold group/btn">
                                        <Shield size={14} className="group-hover/btn:text-gray-900" /> Security
                                    </button>
                                    <div className="h-[1px] bg-gray-50 my-1 mx-2" />
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("token");
                                            localStorage.removeItem("user");
                                            window.location.href = "/";
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-500 hover:bg-rose-50 transition-all font-black"
                                    >
                                        <LogOut size={14} /> Log Out
                                    </button>
                                </div>
                            </div>
                        )}

                        <div
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                                    {user?.name ? getInitials(user.name) : "Y"}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black truncate text-gray-900 leading-tight uppercase tracking-tighter">
                                    {user?.name?.split(' ')[0] || "Yazir"}
                                </p>
                                <p className="text-[10px] font-bold truncate text-gray-400">
                                    Legal Partner
                                </p>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Floating Mobile Toggle */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen?.(true)}
                    className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-gray-900 text-white w-10 h-14 flex items-center justify-center rounded-r-[2rem] shadow-2xl transition-all active:scale-90 border-y border-r border-white/10"
                >
                    <ChevronRight size={20} className="text-[#ee2a7b] translate-x-[-2px]" />
                </button>
            )}
        </>
    );
}
