// ===== SAMPLE STUDY PLANS FOR ROBOTICS & AI STUDENT ===== //

const sampleStudyPlans = [
    {
        id: "robotics-001",
        title: "Machine Learning Fundamentals",
        subject: "computer-science",
        description: "Master the core concepts of ML including supervised learning, neural networks, and deep learning architectures. Focus on practical implementations using Python and TensorFlow.",
        startDate: "2025-09-15",
        deadline: "2025-12-15",
        priority: "high",
        estimatedHours: 80,
        actualHours: 45,
        status: "active",
        progress: 65,
        reminderSettings: {
            frequency: "daily",
            time: 18,
            enabled: true
        },
        methods: ["reading", "practice", "projects", "videos"],
        resources: "Pattern Recognition and Machine Learning by Bishop, Coursera ML Course by Andrew Ng, Kaggle datasets for practice",
        tasks: [
            {
                id: "ml-task-1",
                title: "Linear Regression & Gradient Descent",
                description: "Understand mathematical foundations and implement from scratch",
                estimatedHours: 12,
                actualHours: 8,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-28T10:30:00.000Z",
                order: 0
            },
            {
                id: "ml-task-2",
                title: "Neural Networks & Backpropagation",
                description: "Deep dive into artificial neurons and learning algorithms",
                estimatedHours: 20,
                actualHours: 15,
                difficulty: "hard",
                completed: true,
                completedAt: "2025-10-05T14:20:00.000Z",
                order: 1
            },
            {
                id: "ml-task-3",
                title: "Convolutional Neural Networks",
                description: "Image processing and computer vision applications",
                estimatedHours: 18,
                actualHours: 12,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 2
            },
            {
                id: "ml-task-4",
                title: "Final Project - Robot Vision System",
                description: "Build an object detection system for robotic applications",
                estimatedHours: 30,
                actualHours: 10,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 3
            }
        ],
        createdAt: "2025-09-15T09:00:00.000Z",
        updatedAt: "2025-10-05T14:20:00.000Z",
        lastStudiedAt: "2025-10-05T14:20:00.000Z",
        tags: ["machine-learning", "ai", "python", "tensorflow", "robotics"]
    },
    
    {
        id: "robotics-002",
        title: "Robot Kinematics & Dynamics",
        subject: "engineering",
        description: "Study forward and inverse kinematics, D-H parameters, Jacobian matrices, and dynamic modeling of robotic manipulators for precise motion control.",
        startDate: "2025-09-01",
        deadline: "2025-11-30",
        priority: "high",
        estimatedHours: 60,
        actualHours: 25,
        status: "active",
        progress: 40,
        reminderSettings: {
            frequency: "daily",
            time: 16,
            enabled: true
        },
        methods: ["reading", "practice", "projects"],
        resources: "Robotics: Modelling, Planning and Control by Siciliano, MATLAB Robotics Toolbox, Peter Corke's lectures",
        tasks: [
            {
                id: "kin-task-1",
                title: "D-H Parameter Convention",
                description: "Master Denavit-Hartenberg parameters for robot modeling",
                estimatedHours: 10,
                actualHours: 8,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-20T11:45:00.000Z",
                order: 0
            },
            {
                id: "kin-task-2",
                title: "Forward Kinematics Implementation",
                description: "Calculate end-effector pose from joint angles",
                estimatedHours: 15,
                actualHours: 12,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-10-01T16:30:00.000Z",
                order: 1
            },
            {
                id: "kin-task-3",
                title: "Inverse Kinematics Solutions",
                description: "Solve for joint angles given desired end-effector pose",
                estimatedHours: 20,
                actualHours: 5,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 2
            },
            {
                id: "kin-task-4",
                title: "Jacobian Matrix & Velocity Control",
                description: "Relationship between joint and Cartesian velocities",
                estimatedHours: 15,
                actualHours: 0,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 3
            }
        ],
        createdAt: "2025-09-01T08:00:00.000Z",
        updatedAt: "2025-10-01T16:30:00.000Z",
        lastStudiedAt: "2025-10-01T16:30:00.000Z",
        tags: ["robotics", "kinematics", "matlab", "control-systems", "dynamics"]
    },

    {
        id: "robotics-003",
        title: "Computer Vision for Robotics",
        subject: "computer-science",
        description: "Advanced computer vision techniques for robotic perception including stereo vision, SLAM, object detection, and real-time image processing using OpenCV.",
        startDate: "2025-08-15",
        deadline: "2025-11-15",
        priority: "high",
        estimatedHours: 70,
        actualHours: 55,
        status: "active",
        progress: 78,
        reminderSettings: {
            frequency: "daily",
            time: 19,
            enabled: true
        },
        methods: ["practice", "projects", "videos", "reading"],
        resources: "Computer Vision: Algorithms and Applications by Szeliski, OpenCV Python tutorials, ROS Vision packages",
        tasks: [
            {
                id: "cv-task-1",
                title: "Image Preprocessing & Filtering",
                description: "Gaussian blur, edge detection, morphological operations",
                estimatedHours: 12,
                actualHours: 10,
                difficulty: "easy",
                completed: true,
                completedAt: "2025-08-25T13:15:00.000Z",
                order: 0
            },
            {
                id: "cv-task-2",
                title: "Feature Detection & Matching",
                description: "SIFT, SURF, ORB features for object recognition",
                estimatedHours: 18,
                actualHours: 15,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-10T17:45:00.000Z",
                order: 1
            },
            {
                id: "cv-task-3",
                title: "Stereo Vision & Depth Estimation",
                description: "3D reconstruction from stereo camera pairs",
                estimatedHours: 20,
                actualHours: 18,
                difficulty: "hard",
                completed: true,
                completedAt: "2025-09-25T12:30:00.000Z",
                order: 2
            },
            {
                id: "cv-task-4",
                title: "SLAM Implementation",
                description: "Simultaneous Localization and Mapping algorithms",
                estimatedHours: 20,
                actualHours: 12,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 3
            }
        ],
        createdAt: "2025-08-15T10:00:00.000Z",
        updatedAt: "2025-09-25T12:30:00.000Z",
        lastStudiedAt: "2025-10-03T15:20:00.000Z",
        tags: ["computer-vision", "opencv", "slam", "robotics", "perception"]
    },

    {
        id: "robotics-004",
        title: "Robot Operating System (ROS)",
        subject: "engineering",
        description: "Comprehensive ROS development including nodes, topics, services, navigation stack, and building autonomous robot applications.",
        startDate: "2025-07-01",
        deadline: "2025-12-01",
        priority: "medium",
        estimatedHours: 50,
        actualHours: 35,
        status: "active",
        progress: 70,
        reminderSettings: {
            frequency: "weekly",
            time: 15,
            enabled: true
        },
        methods: ["practice", "projects", "reading"],
        resources: "Programming Robots with ROS by Quigley, ROS Wiki documentation, Gazebo simulation tutorials",
        tasks: [
            {
                id: "ros-task-1",
                title: "ROS Fundamentals & Setup",
                description: "Install ROS, understand nodes, topics, and messages",
                estimatedHours: 8,
                actualHours: 6,
                difficulty: "easy",
                completed: true,
                completedAt: "2025-07-15T14:00:00.000Z",
                order: 0
            },
            {
                id: "ros-task-2",
                title: "Publisher-Subscriber Communication",
                description: "Create custom messages and implement pub-sub pattern",
                estimatedHours: 12,
                actualHours: 10,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-08-05T16:45:00.000Z",
                order: 1
            },
            {
                id: "ros-task-3",
                title: "TF Tree & Robot State Publisher",
                description: "Coordinate transforms and robot model visualization",
                estimatedHours: 15,
                actualHours: 12,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-08-20T11:30:00.000Z",
                order: 2
            },
            {
                id: "ros-task-4",
                title: "Navigation Stack Implementation",
                description: "Path planning, obstacle avoidance, and autonomous navigation",
                estimatedHours: 15,
                actualHours: 7,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 3
            }
        ],
        createdAt: "2025-07-01T09:30:00.000Z",
        updatedAt: "2025-08-20T11:30:00.000Z",
        lastStudiedAt: "2025-09-28T13:15:00.000Z",
        tags: ["ros", "robotics", "linux", "navigation", "gazebo"]
    },

    {
        id: "robotics-005",
        title: "Deep Learning for AI",
        subject: "computer-science",
        description: "Advanced deep learning architectures including CNNs, RNNs, Transformers, and their applications in robotics and autonomous systems.",
        startDate: "2025-10-01",
        deadline: "2025-12-20",
        priority: "high",
        estimatedHours: 90,
        actualHours: 15,
        status: "active",
        progress: 20,
        reminderSettings: {
            frequency: "daily",
            time: 20,
            enabled: true
        },
        methods: ["videos", "practice", "projects", "reading"],
        resources: "Deep Learning by Ian Goodfellow, fast.ai courses, PyTorch tutorials, Papers with Code",
        tasks: [
            {
                id: "dl-task-1",
                title: "Deep Neural Networks Fundamentals",
                description: "Understand architectures, activation functions, optimization",
                estimatedHours: 15,
                actualHours: 8,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-10-08T19:15:00.000Z",
                order: 0
            },
            {
                id: "dl-task-2",
                title: "CNN Architectures (ResNet, VGG, etc.)",
                description: "Study and implement popular CNN architectures",
                estimatedHours: 20,
                actualHours: 7,
                difficulty: "medium",
                completed: false,
                completedAt: null,
                order: 1
            },
            {
                id: "dl-task-3",
                title: "RNN & LSTM for Sequential Data",
                description: "Time series analysis and sequence prediction",
                estimatedHours: 18,
                actualHours: 0,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 2
            },
            {
                id: "dl-task-4",
                title: "Transformer Models & Attention",
                description: "Modern NLP and multimodal AI architectures",
                estimatedHours: 25,
                actualHours: 0,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 3
            },
            {
                id: "dl-task-5",
                title: "Reinforcement Learning for Robotics",
                description: "Q-Learning, Policy Gradients, and robot training",
                estimatedHours: 12,
                actualHours: 0,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 4
            }
        ],
        createdAt: "2025-10-01T08:45:00.000Z",
        updatedAt: "2025-10-08T19:15:00.000Z",
        lastStudiedAt: "2025-10-08T19:15:00.000Z",
        tags: ["deep-learning", "pytorch", "cnn", "rnn", "reinforcement-learning", "ai"]
    },

    {
        id: "robotics-006",
        title: "Control Systems Theory",
        subject: "engineering",
        description: "Classical and modern control theory including PID controllers, state-space methods, and stability analysis for robotic systems.",
        startDate: "2025-08-01",
        deadline: "2025-11-01",
        priority: "medium",
        estimatedHours: 45,
        actualHours: 40,
        status: "completed",
        progress: 100,
        reminderSettings: {
            frequency: "weekly",
            time: 14,
            enabled: false
        },
        methods: ["reading", "practice"],
        resources: "Modern Control Engineering by Ogata, Control Systems Engineering by Nise, MATLAB Control Toolbox",
        tasks: [
            {
                id: "ctrl-task-1",
                title: "Laplace Transforms & Transfer Functions",
                description: "Mathematical foundations of control systems",
                estimatedHours: 10,
                actualHours: 9,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-08-15T10:30:00.000Z",
                order: 0
            },
            {
                id: "ctrl-task-2",
                title: "PID Controller Design & Tuning",
                description: "Proportional-Integral-Derivative control implementation",
                estimatedHours: 12,
                actualHours: 11,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-01T15:45:00.000Z",
                order: 1
            },
            {
                id: "ctrl-task-3",
                title: "State-Space Representation",
                description: "Modern control theory and state feedback",
                estimatedHours: 15,
                actualHours: 13,
                difficulty: "hard",
                completed: true,
                completedAt: "2025-09-18T12:20:00.000Z",
                order: 2
            },
            {
                id: "ctrl-task-4",
                title: "Stability Analysis & Root Locus",
                description: "System stability and performance analysis",
                estimatedHours: 8,
                actualHours: 7,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-30T16:00:00.000Z",
                order: 3
            }
        ],
        createdAt: "2025-08-01T09:00:00.000Z",
        updatedAt: "2025-09-30T16:00:00.000Z",
        lastStudiedAt: "2025-09-30T16:00:00.000Z",
        completedAt: "2025-09-30T16:00:00.000Z",
        tags: ["control-systems", "pid", "matlab", "stability", "robotics"]
    },

    {
        id: "robotics-007",
        title: "Sensors & Actuators in Robotics",
        subject: "engineering",
        description: "Study various sensors (IMU, LiDAR, cameras, encoders) and actuators (servo motors, stepper motors) used in robotic systems.",
        startDate: "2025-09-10",
        deadline: "2025-11-10",
        priority: "medium",
        estimatedHours: 35,
        actualHours: 20,
        status: "active",
        progress: 55,
        reminderSettings: {
            frequency: "weekly",
            time: 16,
            enabled: true
        },
        methods: ["practice", "projects", "reading"],
        resources: "Robotics: Sensors and Actuators by de Silva, Arduino/Raspberry Pi documentation, Sensor datasheets",
        tasks: [
            {
                id: "sensor-task-1",
                title: "IMU & Gyroscope Integration",
                description: "Inertial measurement for robot orientation",
                estimatedHours: 8,
                actualHours: 6,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-20T13:30:00.000Z",
                order: 0
            },
            {
                id: "sensor-task-2",
                title: "LiDAR Point Cloud Processing",
                description: "3D environment mapping and obstacle detection",
                estimatedHours: 12,
                actualHours: 8,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-28T11:45:00.000Z",
                order: 1
            },
            {
                id: "sensor-task-3",
                title: "Motor Control & Encoders",
                description: "Precise motor control with feedback systems",
                estimatedHours: 10,
                actualHours: 6,
                difficulty: "medium",
                completed: false,
                completedAt: null,
                order: 2
            },
            {
                id: "sensor-task-4",
                title: "Sensor Fusion Algorithms",
                description: "Combine multiple sensors for robust perception",
                estimatedHours: 5,
                actualHours: 0,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 3
            }
        ],
        createdAt: "2025-09-10T08:15:00.000Z",
        updatedAt: "2025-09-28T11:45:00.000Z",
        lastStudiedAt: "2025-10-02T14:30:00.000Z",
        tags: ["sensors", "lidar", "imu", "actuators", "robotics", "arduino"]
    },

    {
        id: "robotics-008",
        title: "Embedded Systems Programming",
        subject: "engineering",
        description: "Low-level programming for robotic systems using microcontrollers, real-time systems, and hardware interfaces.",
        startDate: "2025-07-15",
        deadline: "2025-10-15",
        priority: "medium",
        estimatedHours: 40,
        actualHours: 38,
        status: "completed",
        progress: 100,
        reminderSettings: {
            frequency: "weekly",
            time: 17,
            enabled: false
        },
        methods: ["practice", "projects"],
        resources: "Programming Embedded Systems by Barr, STM32 documentation, FreeRTOS tutorials",
        tasks: [
            {
                id: "embed-task-1",
                title: "C Programming for Microcontrollers",
                description: "Memory management, pointers, and embedded C",
                estimatedHours: 12,
                actualHours: 11,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-08-01T09:30:00.000Z",
                order: 0
            },
            {
                id: "embed-task-2",
                title: "GPIO & Peripheral Control",
                description: "Digital I/O, PWM, ADC, and communication protocols",
                estimatedHours: 10,
                actualHours: 9,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-08-15T14:45:00.000Z",
                order: 1
            },
            {
                id: "embed-task-3",
                title: "Real-Time Operating Systems",
                description: "Task scheduling, interrupts, and timing constraints",
                estimatedHours: 12,
                actualHours: 12,
                difficulty: "hard",
                completed: true,
                completedAt: "2025-09-05T16:20:00.000Z",
                order: 2
            },
            {
                id: "embed-task-4",
                title: "Robot Control Firmware",
                description: "Complete firmware for robotic motor control",
                estimatedHours: 6,
                actualHours: 6,
                difficulty: "hard",
                completed: true,
                completedAt: "2025-09-20T12:15:00.000Z",
                order: 3
            }
        ],
        createdAt: "2025-07-15T10:00:00.000Z",
        updatedAt: "2025-09-20T12:15:00.000Z",
        lastStudiedAt: "2025-09-20T12:15:00.000Z",
        completedAt: "2025-09-20T12:15:00.000Z",
        tags: ["embedded-systems", "c-programming", "microcontrollers", "rtos", "firmware"]
    },

    {
        id: "robotics-009",
        title: "Path Planning Algorithms",
        subject: "computer-science",
        description: "Study various path planning algorithms including A*, RRT, Dijkstra for autonomous robot navigation in complex environments.",
        startDate: "2025-09-20",
        deadline: "2025-12-10",
        priority: "high",
        estimatedHours: 55,
        actualHours: 18,
        status: "active",
        progress: 35,
        reminderSettings: {
            frequency: "daily",
            time: 17,
            enabled: true
        },
        methods: ["practice", "videos", "projects"],
        resources: "Planning Algorithms by LaValle, Robotics Path Planning course materials, Python implementation tutorials",
        tasks: [
            {
                id: "path-task-1",
                title: "Graph-based Algorithms (A*, Dijkstra)",
                description: "Optimal path finding in discrete spaces",
                estimatedHours: 15,
                actualHours: 12,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-10-05T15:30:00.000Z",
                order: 0
            },
            {
                id: "path-task-2",
                title: "Sampling-based Methods (RRT, PRM)",
                description: "Probabilistic roadmaps for high-dimensional spaces",
                estimatedHours: 18,
                actualHours: 6,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 1
            },
            {
                id: "path-task-3",
                title: "Dynamic Window Approach",
                description: "Real-time obstacle avoidance for mobile robots",
                estimatedHours: 12,
                actualHours: 0,
                difficulty: "medium",
                completed: false,
                completedAt: null,
                order: 2
            },
            {
                id: "path-task-4",
                title: "Multi-Robot Path Planning",
                description: "Coordinate multiple robots in shared workspace",
                estimatedHours: 10,
                actualHours: 0,
                difficulty: "hard",
                completed: false,
                completedAt: null,
                order: 3
            }
        ],
        createdAt: "2025-09-20T11:00:00.000Z",
        updatedAt: "2025-10-05T15:30:00.000Z",
        lastStudiedAt: "2025-10-05T15:30:00.000Z",
        tags: ["path-planning", "algorithms", "navigation", "robotics", "autonomous-systems"]
    },

    {
        id: "robotics-010",
        title: "Human-Robot Interaction",
        subject: "computer-science",
        description: "Study interface design, natural language processing, gesture recognition, and social robotics for effective human-robot collaboration.",
        startDate: "2025-08-20",
        deadline: "2025-11-20",
        priority: "low",
        estimatedHours: 30,
        actualHours: 12,
        status: "active",
        progress: 30,
        reminderSettings: {
            frequency: "weekly",
            time: 19,
            enabled: true
        },
        methods: ["reading", "videos", "projects"],
        resources: "Human-Robot Interaction by Goodrich, Speech recognition libraries, OpenPose for gesture recognition",
        tasks: [
            {
                id: "hri-task-1",
                title: "Speech Recognition & NLP",
                description: "Voice commands and natural language understanding",
                estimatedHours: 10,
                actualHours: 7,
                difficulty: "medium",
                completed: true,
                completedAt: "2025-09-10T13:45:00.000Z",
                order: 0
            },
            {
                id: "hri-task-2",
                title: "Gesture Recognition Systems",
                description: "Computer vision for human gesture interpretation",
                estimatedHours: 8,
                actualHours: 5,
                difficulty: "medium",
                completed: false,
                completedAt: null,
                order: 1
            },
            {
                id: "hri-task-3",
                title: "Social Robot Behaviors",
                description: "Design engaging and helpful robot personalities",
                estimatedHours: 8,
                actualHours: 0,
                difficulty: "medium",
                completed: false,
                completedAt: null,
                order: 2
            },
            {
                id: "hri-task-4",
                title: "User Interface Design",
                description: "Intuitive interfaces for robot control and feedback",
                estimatedHours: 4,
                actualHours: 0,
                difficulty: "easy",
                completed: false,
                completedAt: null,
                order: 3
            }
        ],
        createdAt: "2025-08-20T14:30:00.000Z",
        updatedAt: "2025-09-10T13:45:00.000Z",
        lastStudiedAt: "2025-09-25T16:20:00.000Z",
        tags: ["hri", "nlp", "gesture-recognition", "social-robotics", "ui-design"]
    }
];

// Export for use in the application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sampleStudyPlans;
} else {
    window.sampleStudyPlans = sampleStudyPlans;
}

// Auto-populate sample data on first visit
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the first time visiting
    if (!localStorage.getItem('studyPlans') || JSON.parse(localStorage.getItem('studyPlans')).length === 0) {
        console.log('Loading sample data for new user...');
        
        // Add sample plans to the app
        if (window.studyApp) {
            window.studyApp.studyPlans = [...sampleStudyPlans];
            window.studyApp.saveToStorage();
            
            // Show welcome message
            setTimeout(() => {
                if (window.studyApp.showNotification) {
                    window.studyApp.showNotification(
                        'Welcome! Sample study plans loaded for Robotics & AI student. You can edit or delete them anytime.',
                        'info',
                        true
                    );
                }
            }, 2000);
        }
    }
});
