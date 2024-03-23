import { Component, Input, SimpleChanges, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnInit, Renderer2, RendererFactory2, ApplicationRef } from '@angular/core';
import { Instructor, Slot, Review } from '../models/instructor';
import { CartService, CartItem } from '../services/cart.service';
import { FormControl } from '@angular/forms';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { faCalendarMinus, faL, faSterlingSign } from '@fortawesome/free-solid-svg-icons';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { InstructorService } from '../services/instructor.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { PickupLocation } from 'src/app/models/pickup-location';

import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { AppUser, AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss'],
})
export class InstructorProfileComponent implements OnInit, AfterViewInit {
  @Input() instructor!: Instructor;

  isLoadingDates: boolean = true; // Initially data is loading
  isLoadingTimes: boolean = true; // Initially data is loading

  @ViewChild('dateSwiperRef') dateSwiperRef!: ElementRef;
  @ViewChild('timeSlotsSwiperRef') timeSlotsSwiperRef!: ElementRef;
  @ViewChild('curriculumSwiperRef') curriculumSwiperRef!: ElementRef;

  dateSwiper!: Swiper;
  timeSlotsSwiper!: Swiper;
  curriculumSwiper!: Swiper;

  retryCount: number = 0; // Counter to track retry attempts
  maxRetries: number = 10; // Maximum number of retries

  pickupLocations: PickupLocation[] = []; // Declare the property
  mapCenters: google.maps.LatLngLiteral[] = [];
  zoom: number = 18;
  mapOptions: google.maps.MapOptions = {
    draggable: false,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    gestureHandling: 'none', // Disables map gestures
    styles: [
      { // Hide all labels including points of interest
        featureType: 'all',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      { // Show road labels only
        featureType: 'road',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      }
    ]
  };
  userId: string | null = null;

  private renderer: Renderer2;

  calendarDays: any[] = [];
  selectedDayIndex: number | null = null; // Declare selectedDayIndex
  selectedTimeIndex: number | null = null; // New property for selected time slot index

  faSterlingSign = faSterlingSign;
  selectedDate: Date | null = null;
  availableSlots: {
    type: string; start: string; end: string
  }[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;
  selectedDateControl = new FormControl();
  times: { label: string, available: boolean }[] = [];
  selectedTime: string | null = null;
  lessonDuration: number = 1;
  selectedTransmission: string | null = null;

  isAutomatic: boolean = false; // Default to manual

  setTransmission(mode: string): void {
    this.isAutomatic = mode === 'automatic';
  }
  scheduledLessons = [
    { date: '2023-10-01', time: '10:00 AM', duration: 1, transmission: 'Automatic' },
    { date: '2023-10-05', time: '2:00 PM', duration: 2, transmission: 'Manual' },
    { date: '2023-10-10', time: '5:00 PM', duration: 1, transmission: 'Automatic' },

  ];

  modules = [
    {
      moduleName: "Basics",
      lessons: [
        { title: "Introduction", description: "Introduction to the vehicle and initial setup.", keywords: ["vehicle setup", "initial orientation"] },
        { title: "Controls", description: "Familiarization with vehicle controls including pedals, gears, and steering.", keywords: ["pedals", "gears", "steering"] },
        { title: "Moving Off", description: "Techniques for safely starting and moving off from a stop.", keywords: ["safe start", "clutch control"] },
        { title: "Stopping", description: "Procedures for safely stopping the vehicle.", keywords: ["safe stop", "brake use"] },
        { title: "Steering Basics", description: "Basics of steering control and vehicle maneuvering.", keywords: ["steering control", "maneuvering"] },
        { title: "Speed Control", description: "Understanding speed management and control.", keywords: ["speed management", "acceleration"] },
        { title: "Gear Basics", description: "Introduction to using gears for speed control and efficiency.", keywords: ["gear shifting", "efficiency"] },
        { title: "Meeting Traffic", description: "Navigating safely around other road users.", keywords: ["road users", "navigating traffic"] },
      ],
    },
    {
      moduleName: "Intermediate Skills",
      lessons: [
        { title: "T-junctions Intro", description: "Approaching, navigating, and exiting T-junctions.", keywords: ["approach", "navigate", "exit"] },
        { title: "Roundabouts Intro", description: "Understanding roundabout navigation and lane usage.", keywords: ["navigation", "lane usage"] },
        { title: "Crossroads", description: "Handling crossroads with confidence.", keywords: ["confidence", "handling"] },
        { title: "Emergency Stops", description: "Performing emergency stops safely and effectively.", keywords: ["safety", "effective stopping"] },
        { title: "Pedestrian Crossings", description: "Approaching and navigating pedestrian crossings.", keywords: ["approaching", "navigating"] },
        { title: "Positioning", description: "Correct vehicle positioning on the road for various scenarios.", keywords: ["vehicle positioning", "road scenarios"] },
        { title: "Mirror Use", description: "Effective use of mirrors for awareness and safety.", keywords: ["awareness", "safety"] },
        { title: "Signal Timing", description: "Timely and effective use of signals.", keywords: ["signals", "timely use"] },
        { title: "Lane Discipline", description: "Maintaining proper lane discipline and understanding lane changes.", keywords: ["lane changes", "discipline"] },
        { title: "Anticipation", description: "Anticipating the actions of other road users for safer driving.", keywords: ["road user actions", "safety"] },
        { title: "Awareness", description: "Developing a keen awareness of the driving environment.", keywords: ["environment", "keen observation"] },
        { title: "Junctions Advanced", description: "Advanced techniques for dealing with complex junctions.", keywords: ["complex junctions", "advanced techniques"] },
        { title: "Roundabouts Advanced", description: "Mastering complex roundabouts with multiple lane changes.", keywords: ["complex navigation", "multiple lanes"] },
      ],
    },
    {
      moduleName: "Advanced Driving",
      lessons: [
        { title: "Dual Carriageways Intro", description: "Introduction to driving on dual carriageways.", keywords: ["high-speed roads", "lane discipline"] },
        { title: "Independent Driving", description: "Practicing driving independently by following directions.", keywords: ["following directions", "independence"] },
        { title: "Night Driving", description: "Understanding the challenges and techniques of night driving.", keywords: ["reduced visibility", "headlight use"] },
        { title: "Rural Roads", description: "Navigating the unique challenges of rural roads.", keywords: ["unique challenges", "navigating"] },
        { title: "Urban Driving", description: "Mastering the complexities of urban driving environments.", keywords: ["complex environments", "urban navigation"] },
        { title: "Eco-Driving", description: "Learning efficient driving techniques for fuel saving and reduced emissions.", keywords: ["fuel saving", "emission reduction"] },
        { title: "Clutch Control", description: "Mastering clutch control for smoother driving.", keywords: ["smooth driving", "clutch use"] },
        { title: "Hill Starts", description: "Techniques for starting on a hill without rolling back.", keywords: ["inclines", "no roll-back"] },
        { title: "Parallel Parking", description: "Skills for parallel parking in tight spaces.", keywords: ["tight spaces", "parking technique"] },
        { title: "Bay Parking", description: "Practicing parking in bay areas safely.", keywords: ["parking bays", "safety"] },
        { title: "Reverse Parking", description: "Mastering the technique of reverse parking.", keywords: ["reverse maneuver", "parking skill"] },
        { title: "Pulling Over", description: "Safely pulling over and stopping by the side of the road.", keywords: ["roadside stops", "safety"] },
        { title: "Reversing", description: "Skills for safely reversing the vehicle over distances.", keywords: ["backward navigation", "distance control"] },
        { title: "Turn in the Road", description: "Executing a safe and effective turn in the road (three-point turn).", keywords: ["three-point turn", "maneuvering"] },
        { title: "Vehicle Safety", description: "Understanding vehicle safety features and maintenance checks.", keywords: ["safety features", "maintenance"] },
        { title: "Motorways Intro", description: "Introduction to motorway driving and etiquette.", keywords: ["motorway etiquette", "high-speed driving"] },
        { title: "Wet Weather Driving", description: "Techniques for safe driving in wet conditions.", keywords: ["rain", "slippery conditions"] },
        { title: "Snow/Ice Driving", description: "Navigating safely in snow and icy conditions.", keywords: ["cold weather", "traction control"] },
        { title: "Fog Driving", description: "Adapting driving techniques for foggy conditions.", keywords: ["low visibility", "fog lights"] },
        { title: "Driving Etiquette", description: "Understanding and practicing good driving etiquette.", keywords: ["courtesy", "road manners"] },
      ],
    },
    {
      moduleName: "Test Preparation",
      lessons: [
        { title: "Mock Test 1", description: "First mock test to simulate the driving test experience.", keywords: ["simulation", "test experience"] },
        { title: "Mock Test 2", description: "Second mock test focusing on areas of improvement.", keywords: ["focused improvement", "practice"] },
        { title: "Pre-Test Review", description: "Review session to cover all key areas before the test.", keywords: ["key area review", "test readiness"] },
        { title: "Test Day Prep", description: "Final preparations and tips for the driving test day.", keywords: ["final tips", "test day strategy"] },
      ],
    },
  ];


  sampleReviews = [
    {
      reviewerImage: 'path_to_image1.jpg',
      reviewerName: 'John Doe',
      rating: 4.5,
      comment: 'Great instructor! Learned a lot from the lessons.'
    },
    {
      reviewerImage: 'path_to_image2.jpg',
      reviewerName: 'Jane Smith',
      rating: 5,
      comment: 'Highly recommend! Very patient and knowledgeable.'
    },

  ];

  constructor
    (
      private cartService: CartService,
      private cdr: ChangeDetectorRef,
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer,
      private route: ActivatedRoute,
      private instructorService: InstructorService,
      private dialog: MatDialog,
      rendererFactory: RendererFactory2,
      private appRef: ApplicationRef,
      private authService: AuthService,
      private userService: UserService,
    ) {
    const icons = ['star-icon', 'currencygbp'];
    icons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/${icon}.svg`)
      );
    });
    this.renderer = rendererFactory.createRenderer(null, null);

  }

  ngOnInit() {
    
    console.log('test');
    const instructorId = this.route.snapshot.paramMap.get('id');
    if (instructorId) {
      this.instructorService.fetchInstructorById(instructorId)
        .then(instructor => {
          this.instructor = instructor;
          this.generateCalendarDays();

          // After your data is loaded and calendar days are generated, 
          // you might want to initialize or refresh your swiper here.
        })
        .catch(error => {
          console.error('Error fetching instructor data:', error);
        });

      this.authService.appUserData$.subscribe((appUser: AppUser | null) => {
        if (appUser) {
          this.userId = appUser.uid;
          this.loadPickupLocations(appUser.uid);
        }

      });
    }
  }


  private loadPickupLocations(userId: string | null): void {
    if (userId) {
      this.userService.getPickupLocationsForUser(userId).subscribe(locations => {
        this.pickupLocations = locations;
        this.mapCenters = locations.map(loc => ({
          lat: loc.coordinates.lat, // Changed from geopoint.latitude to coordinates.lat
          lng: loc.coordinates.lng  // Changed from geopoint.longitude to coordinates.lng
        }));
      });
    } else {
      this.pickupLocations = [];
      this.mapCenters = [];
    }
  }


  editLocation(location: PickupLocation): void {
    // Logic to handle editing the location
    // Possibly open a dialog with a form to edit the location
    console.log('Edit location:', location);
  }

  deleteLocation(location: PickupLocation): void {
    if (this.userId && location.id) {
      if (confirm('Are you sure you want to delete this location?')) {
        this.userService.deletePickupLocation(this.userId, location.id).then(() => {
          this.loadPickupLocations(this.userId);
        });
      }
    } else {
      console.error('User ID or Location ID is undefined');
    }
  }

  addNewLocation(): void {
    // Open the Change Address Dialog when the button is clicked
    // this.openChangeAddressDialog();
  }

  ngAfterViewInit(): void {
    // Use a slight delay to ensure the DOM elements are fully ready
    setTimeout(() => {
      console.log('Attempting to initialize Swipers directly in ngAfterViewInit');
      this.tryInitializeSwipers();
      this.setEarliestAvailableDateTime();
      this.isLoadingDates = false;
    }, 1000);

  }

  setEarliestAvailableDateTime(): void {
    if (!this.dateSwiper || !this.timeSlotsSwiper) {
      // If Swipers are not initialized, delay the selection.
      setTimeout(() => this.setEarliestAvailableDateTime(), 100);
      return;
    }

    // Proceed with finding and setting the earliest available day and time.
    const availableDayIndex = this.calendarDays.findIndex(day => day.isAvailable && !day.isEmpty);
    if (availableDayIndex !== -1) {
      this.selectDay(availableDayIndex);

      setTimeout(() => {
        const availableTimeIndex = this.times.findIndex(time => time.available);
        if (availableTimeIndex !== -1) {
          this.selectTimeSlot(availableTimeIndex);
        }
        this.isLoadingTimes = false;
      }, 100); // Adjust this timeout based on your application's needs.
    }
  }


  tryInitializeSwipers(): void {
    try {
      this.initializeSwipers();
    } catch (error) {
      console.error('Error initializing Swipers:', error);
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        console.log(`Retrying initialization... Attempt ${this.retryCount}`);
        setTimeout(() => this.tryInitializeSwipers(), 100 * this.retryCount); // Increase delay with each retry
      } else {
        console.error('Failed to initialize Swipers after maximum retries.');
      }
    }
  }

  initializeSwipers(): void {
    // Ensure Swiper elements are available
    if (!this.dateSwiperRef || !this.timeSlotsSwiperRef || !this.curriculumSwiperRef) {
      throw new Error("Swiper elements not available");
    }

    this.dateSwiper = new Swiper(this.dateSwiperRef.nativeElement, {
      modules: [Navigation],
      slidesPerView: 7,
      slidesPerGroup: 7,
      spaceBetween: 10,
      loop: false,
      navigation: {
        nextEl: '.date-next',
        prevEl: '.date-prev',
      },
    });

    this.timeSlotsSwiper = new Swiper(this.timeSlotsSwiperRef.nativeElement, {
      modules: [Navigation],
      slidesPerView: 5,
      slidesPerGroup: 5,
      spaceBetween: 10,
      loop: false,
      navigation: {
        nextEl: '.time-next',
        prevEl: '.time-prev',
      },
    });


    this.curriculumSwiper = new Swiper(this.curriculumSwiperRef.nativeElement, {
      modules: [Navigation],
      slidesPerView: 3,
      slidesPerGroup: 3,
      spaceBetween: 5,
      loop: false,
      navigation: {
        nextEl: '.curriculum-next',
        prevEl: '.curriculum-prev',
      },
    });

  }

  updateCurriculumSlides(): void {
    this.curriculumSwiper.removeAllSlides();

    this.modules.forEach((module, moduleIndex) => {
      module.lessons.forEach((lesson, lessonIndex) => {
        const slideEl = this.renderer.createElement('div');
        this.renderer.addClass(slideEl, 'swiper-slide');
        this.renderer.addClass(slideEl, 'curriculum-swiper-slide');

        const slideContentWrapper = this.renderer.createElement('div');
        this.renderer.addClass(slideContentWrapper, 'curriculum-content-wrapper');
        this.applySlideContentWrapperStyles(slideContentWrapper);

        // Radio button and title container
        const titleContainer = this.renderer.createElement('div');
        this.renderer.setStyle(titleContainer, 'display', 'flex');
        this.renderer.setStyle(titleContainer, 'alignItems', 'center');

        const radioButton = this.renderer.createElement('div');
        this.renderer.addClass(radioButton, 'radio-button');
        this.applyRadioButtonStyles(radioButton, slideContentWrapper.classList.contains('selected'));

        const moduleNameEl = this.renderer.createElement('h4');
        this.renderer.setStyle(moduleNameEl, 'margin', '0');
        this.renderer.setStyle(moduleNameEl, 'line-height', '1.3'); 
        const moduleNameText = this.renderer.createText(`${module.moduleName} ${lessonIndex + 1} - ${lesson.title}`);
        this.renderer.appendChild(moduleNameEl, moduleNameText);

        this.renderer.appendChild(titleContainer, radioButton);
        this.renderer.appendChild(titleContainer, moduleNameEl);

        // Keywords and details container
        const detailsContainer = this.renderer.createElement('div');
        this.renderer.setStyle(detailsContainer, 'display', 'flex');
        this.renderer.setStyle(detailsContainer, 'flexDirection', 'column');
        this.renderer.setStyle(detailsContainer, 'alignItems', 'flex-start');
        this.renderer.setStyle(detailsContainer, 'justify-content', 'space-between');
        this.renderer.setStyle(detailsContainer, 'marginTop', '10px');
        this.renderer.setStyle(detailsContainer, 'width', '100%');
        this.renderer.setStyle(detailsContainer, 'height', '100%');

        const keywordContainer = this.renderer.createElement('div');
        this.renderer.setStyle(keywordContainer, 'display', 'flex');
        this.renderer.setStyle(keywordContainer, 'flexWrap', 'wrap');
        // this.renderer.setStyle(keywordContainer, 'alignItems', 'center');
        this.renderer.setStyle(keywordContainer, 'width', '100%');

        lesson.keywords.forEach(keyword => {
          const keywordEl = this.renderer.createElement('span');
          this.renderer.addClass(keywordEl, 'keyword');
          this.applyKeywordStyles(keywordEl);
          const keywordText = this.renderer.createText(keyword);
          this.renderer.appendChild(keywordEl, keywordText);
          this.renderer.appendChild(keywordContainer, keywordEl);
        });

        const detailsText = this.renderer.createElement('span');
        this.applyDetailsTextStyle(detailsText);
        const textNode = this.renderer.createText('More details');
        this.renderer.appendChild(detailsText, textNode);

        this.renderer.appendChild(detailsContainer, keywordContainer);
        this.renderer.appendChild(detailsContainer, detailsText);

        // Assemble the slide content
        this.renderer.appendChild(slideContentWrapper, titleContainer);
        this.renderer.appendChild(slideContentWrapper, detailsContainer);
        this.renderer.appendChild(slideEl, slideContentWrapper);

        this.initializeSelectionAndHoverEffects(slideContentWrapper, radioButton);

        this.curriculumSwiper.appendSlide(slideEl);
      });
    });

    this.curriculumSwiper.update();
  }

  navigateToModule(moduleIndex: number): void {
    // Accumulate total lessons up to the selected module to calculate slide index
    let slideIndex = 0;
    for (let i = 0; i < moduleIndex; i++) {
      slideIndex += this.modules[i].lessons.length;
    }
  
    this.curriculumSwiper.slideTo(slideIndex);
  }
  


  applyDetailsTextStyle(element: any): void {
    this.renderer.setStyle(element, 'color', '#007bff');
    this.renderer.setStyle(element, 'fontWeight', '700');
    this.renderer.setStyle(element, 'cursor', 'pointer');
    this.renderer.setStyle(element, 'paddingTop', '10px'); // Adjust as needed for spacing
    this.renderer.setStyle(element, 'align-self', 'end'); // Adjust as needed for spacing

    // Add hover effect for underlining the text
    this.renderer.listen(element, 'mouseenter', () => {
      this.renderer.setStyle(element, 'textDecoration', 'underline');
    });

    this.renderer.listen(element, 'mouseleave', () => {
      this.renderer.setStyle(element, 'textDecoration', 'none');
    });
  }

  applyKeywordStyles(keywordEl: any): void {
    this.renderer.setStyle(keywordEl, 'background-color', '#f0f0f0'); 
    this.renderer.setStyle(keywordEl, 'border-radius', '15px'); 
    this.renderer.setStyle(keywordEl, 'padding', '5px 10px'); 
    this.renderer.setStyle(keywordEl, 'margin', '2px'); 
    this.renderer.setStyle(keywordEl, 'font-size', '0.65rem'); 
    this.renderer.setStyle(keywordEl, 'font-weight', '500'); 
    this.renderer.setStyle(keywordEl, 'color', '#333'); 
    this.renderer.setStyle(keywordEl, 'text-align', 'center'); 
    this.renderer.setStyle(keywordEl, 'line-height', '1.4');
    this.renderer.setStyle(keywordEl, 'display', 'flex'); 
    this.renderer.setStyle(keywordEl, 'flex-direction', 'column'); 
    this.renderer.setStyle(keywordEl, 'justify-content', 'center'); 
    this.renderer.setStyle(keywordEl, 'max-width', '50%'); 
    // text-align: center;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
  }

  applySlideContentWrapperStyles(wrapper: any): void {

    this.renderer.setStyle(wrapper, 'display', 'flex');
    this.renderer.setStyle(wrapper, 'flexDirection', 'column');
    this.renderer.setStyle(wrapper, 'alignItems', 'flex-start');
    this.renderer.setStyle(wrapper, 'backgroundColor', '#fff');
    this.renderer.setStyle(wrapper, 'border', '2px solid transparent');
    this.renderer.setStyle(wrapper, 'borderRadius', '8px');
    this.renderer.setStyle(wrapper, 'boxShadow', '0 2px 4px rgba(0,0,0,0.1)');
    this.renderer.setStyle(wrapper, 'padding', '15px');
    this.renderer.setStyle(wrapper, 'margin', '5px');
    // this.renderer.setStyle(wrapper, 'boxSizing', 'border-box');
    this.renderer.setStyle(wrapper, 'height', '150px');
    this.renderer.setStyle(wrapper, 'fontSize', '0.7rem');
    this.renderer.setStyle(wrapper, 'cursor', 'pointer'); // Cursor style moved here
  }

  applyRadioButtonStyles(radioButton: any, isSelected: boolean): void {
    this.renderer.setStyle(radioButton, 'height', '16px');
    this.renderer.setStyle(radioButton, 'width', '16px');
    this.renderer.setStyle(radioButton, 'borderRadius', '50%');
    // this.renderer.setStyle(radioButton, 'marginTop', '13px');
    this.renderer.setStyle(radioButton, 'marginRight', '13px');
    this.renderer.setStyle(radioButton, 'border', '2px solid white');
    this.renderer.setStyle(radioButton, 'outline', '2px solid #c6c6c6');
    this.renderer.setStyle(radioButton, 'flexShrink', '0');
    if (isSelected) {
      this.renderer.setStyle(radioButton, 'backgroundColor', '#007bff');
      this.renderer.setStyle(radioButton, 'outline', '2px solid #007bff');
    } else {
      this.renderer.setStyle(radioButton, 'backgroundColor', 'transparent');
    }
  }

  initializeSelectionAndHoverEffects(wrapper: any, radioButton: any): void {
    // Selection mechanism focused on the wrapper
    this.renderer.listen(wrapper, 'click', () => {
      document.querySelectorAll('.curriculum-content-wrapper').forEach(el => {
        this.renderer.removeClass(el, 'selected');
        // Reset radio button style
        this.renderer.setStyle(el.querySelector('.radio-button'), 'backgroundColor', 'transparent');
        this.renderer.setStyle(el.querySelector('.radio-button'), 'outline', '2px solid #c6c6c6c4');
        this.renderer.setStyle(el, 'border', '2px solid transparent');
      });

      // Mark the clicked slide as selected and update radio button style
      this.renderer.addClass(wrapper, 'selected');
      this.renderer.setStyle(wrapper, 'transition', 'all 0.3s ease-in-out');
      this.renderer.setStyle(wrapper, 'border', '2px solid #007bff');
      this.renderer.setStyle(radioButton, 'backgroundColor', '#007bff');
      this.renderer.setStyle(radioButton, 'outline', '2px solid #007bff');
    });

    // Hover effect applied to the radio button instead of the content wrapper
    this.renderer.listen(wrapper, 'mouseenter', () => {
      if (!wrapper.classList.contains('selected')) {
        this.renderer.setStyle(wrapper, 'border', '2px solid rgba(0, 123, 255, 0.1)');
        this.renderer.setStyle(radioButton, 'backgroundColor', 'rgba(0, 123, 255, 0.1)');
        // this.renderer.setStyle(radioButton, 'outline', '2px solid rgba(0, 123, 255, 0.1)');
      }
    });

    this.renderer.listen(wrapper, 'mouseleave', () => {
      if (!wrapper.classList.contains('selected')) {
        this.renderer.setStyle(radioButton, 'backgroundColor', 'transparent');
        this.renderer.setStyle(wrapper, 'border', '2px solid transparent');

      } else {
        // Ensure the radio button stays filled if the slide is selected
        this.renderer.setStyle(radioButton, 'backgroundColor', '#007bff');
      }
    });
  }

  updateSwiperSlides(): void {
    // Store the current active index to preserve swiper position
    const currentIndex = this.timeSlotsSwiper.activeIndex;

    // Assuming this.timeSlotsSwiper is correctly instantiated
    this.timeSlotsSwiper.removeAllSlides();

    this.times.forEach((time, index) => {
      const isSelected = this.selectedTimeIndex === index;
      const backgroundColor = isSelected ? '#007bff' : '#fff'; // Selected or default background color
      const textColor = isSelected ? '#fff' : '#999'; // Selected or default text color

      // Create the slide element
      const slideEl = this.renderer.createElement('div');
      this.renderer.addClass(slideEl, 'swiper-slide');
      this.renderer.setStyle(slideEl, 'display', 'flex');
      this.renderer.setStyle(slideEl, 'align-items', 'center');
      this.renderer.setStyle(slideEl, 'justify-content', 'center');
        

      // Create the slide content with conditional background color
      const slideContent = this.renderer.createElement('div');
      this.renderer.addClass(slideContent, 'slide-content');
      this.renderer.setAttribute(slideContent, 'style', `background: ${backgroundColor}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; font-size: 1rem; width: 100%; height: 45px; display: flex; justify-content: center; align-items: center; margin: 5px; cursor: pointer; transition: all 0.3s ease-in-out;`);

      // Create the time slot with conditional text color
      const timeSlot = this.renderer.createElement('div');
      this.renderer.addClass(timeSlot, 'time-slot');
      this.renderer.setAttribute(timeSlot, 'style', `font-size: 0.85rem; color: ${textColor}; width: 100%;`);
      const text = this.renderer.createText(time.label);
      this.renderer.appendChild(timeSlot, text);

      // Construct the slide
      this.renderer.appendChild(slideContent, timeSlot);
      this.renderer.appendChild(slideEl, slideContent);
      this.timeSlotsSwiper.appendSlide(slideEl);

      // Attach click and hover events
      this.renderer.listen(slideEl, 'click', () => this.selectTimeSlot(index));
      this.renderer.listen(slideEl, 'mouseenter', () => {
        if (!isSelected) {
          this.renderer.setStyle(slideContent, 'transition', 'all 0.3s ease-in-out');
          this.renderer.setStyle(slideContent, 'backgroundColor', 'rgba(0, 123, 255, 0.1)');
        }
      });
      this.renderer.listen(slideEl, 'mouseleave', () => {
        this.renderer.setStyle(slideContent, 'backgroundColor', backgroundColor);
      });
    });

    // After updating the slides, navigate back to the previously active slide to preserve position
    setTimeout(() => this.timeSlotsSwiper.slideTo(currentIndex, 0), 0); // 0 speed for an immediate transition
  }

  selectTimeSlot(index: number): void {
    this.selectedTimeIndex = index;
    console.log(`Selected time slot index: ${index}`);
    this.updateSwiperSlides(); // Refresh the swiper slides to apply the selected state
  }

  generateCalendarDays(): void {
    const today = new Date();
    // Prepend 3 empty slots marked with `isEmpty: true`
    this.calendarDays = Array(3).fill({ isEmpty: true }).concat(
      Array.from({ length: 14 }, (_, i) => {
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + i);
        const dateString = this.formatDate(futureDate);
        const dayOfWeek = futureDate.toLocaleDateString('en-US', { weekday: 'long' });
        const isAvailable = this.checkDateAvailability(dayOfWeek, dateString);
        return { date: futureDate, isAvailable, isEmpty: false };
      })
    );
  }

  checkDateAvailability(dayOfWeek: string, dateString: string): boolean {
    const slots = this.instructor.availability[dayOfWeek] || [];
    return slots.some(slot => slot.type === 'available');
  }

  selectDay(index: number): void {
    console.log(`[selectDay] Called with index: ${index}`);
    if (this.calendarDays[index].isAvailable) {
      this.selectedDayIndex = index;
      console.log(`[selectDay] Day is available. Generating time slots for date: ${this.calendarDays[index].date}`);
      this.generateTimeSlotsForDay(this.calendarDays[index].date);
      this.updateSwiperSlides();
      this.updateCurriculumSlides();
    }

  }

  generateTimeSlotsForDay(selectedDate: Date): void {
    console.log(`[generateTimeSlotsForDay] Called with selectedDate: ${selectedDate}`);
    this.times = []; // Reset times array for the new selection
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`[generateTimeSlotsForDay] Day of week: ${dayOfWeek}`);

    const slots: Slot[] = this.instructor.availability[dayOfWeek] || [];
    console.log(`[generateTimeSlotsForDay] Slots found: ${slots.length}`);

    slots.forEach((slot, index) => {
      console.log(`[generateTimeSlotsForDay] Processing slot ${index}:`, slot);
      if (slot.type === 'available') {
        const startTime = this.timeToMinutes(slot.start);
        const endTime = this.timeToMinutes(slot.end);
        for (let time = startTime; time < endTime; time += 15) {
          if (time + 15 <= endTime) {
            this.times.push({ label: this.minutesToTime(time), available: true });
            console.log(`[generateTimeSlotsForDay] Added time slot: ${this.minutesToTime(time)}`);
          }
        }
      }
    });
  }

  selectTime(index: number): void {
    this.selectedTimeIndex = index;
    this.selectedTime = this.times[index].label; // Assuming this.times is your array of time slots
    // You might want to perform more actions here, such as fetching availability for the selected time slot
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  isDayAvailable(dayName: string): boolean {
    const daySlots = this.instructor.availability[dayName] || [];
    return daySlots.some(slot => slot.type === 'available');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['instructor']) {
      this.setEarliestAvailableDate();
      this.availableSlots = this.getAvailableSlotsForInstructor(this.instructor, this.selectedDate);
    }
  }

  openPaymentDialog(): void {
    this.dialog.open(PaymentDialogComponent, {
      width: '800px',
      height: '800px',
    });
  }

  getStarCounts(): { rating: number, count: number, percentage: number }[] {
    const counts = [5, 4, 3, 2, 1].map(star => {
      const count = this.instructor.reviews.filter(review => review.rating === star).length;
      const percentage = (count / this.instructor.reviews.length) * 100;
      return { rating: star, count, percentage };
    });
    return counts;
  }

  getAverageRating(): number {
    if (!this.instructor.reviews || this.instructor.reviews.length === 0) {
      return 0;
    }
    const totalStars = this.instructor.reviews.reduce((sum, review) => sum + review.rating, 0);
    return +(totalStars / this.instructor.reviews.length).toFixed(1);
  }

  initializeInstructorData(): void {
    this.calculateRatingAndReviews();
    this.setEarliestAvailableDate();
    this.availableSlots = this.getAvailableSlotsForInstructor(this.instructor, this.selectedDate);
    this.selectedDateControl.valueChanges.subscribe(value => {
      this.selectedDate = value;
      this.availableSlots = this.getAvailableSlotsForInstructor(this.instructor, this.selectedDate);
      this.generateTimesList();

    });
    this.generateTimesList();

    if (this.instructor.lessonDuration && this.instructor.lessonDuration.length > 0) {
      this.lessonDuration = this.instructor.lessonDuration[0];
    }

    if (this.instructor.transmission && this.instructor.transmission.length > 0) {
      this.selectedTransmission = this.instructor.transmission[0];
    }
  }

  timeToNumber(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onTimeSelected(event: any): void {
    this.selectedTime = event.value;
  }

  addToCart(): void {
    const cartItem: CartItem = {
      instructor: this.instructor,
      date: this.selectedDate!,
      start: this.selectedTime!,
      end: this.numberToTime(this.timeToNumber(this.selectedTime!) + (this.lessonDuration * 60)),
      price: this.getTotalPrice(),
      duration: this.lessonDuration,
      transmission: this.selectedTransmission!,
      _id: ''
    };
    this.cartService.addToCart(cartItem);
  }

  getTotalPrice(): number {
    if (this.instructor && this.lessonDuration) {
      return this.instructor.price * this.lessonDuration;
    }
    return 0;
  }

  numberToTime(number: number): string {
    const hours = Math.floor(number / 60);
    const minutes = number % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  generateTimesList(): void {
    this.times = [];
    for (let i = 0; i < 24 * 4; i++) {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const available = this.isTimeAvailable(timeLabel);
      if (available) {
        this.times.push({ label: timeLabel, available });
      }
    }
  }

  setEarliestAvailableDate(): void {
    let earliestDate: Date | null = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const slotsOnDate = this.getAvailableSlotsForInstructor(this.instructor, checkDate);
      if (slotsOnDate.length > 0) {
        earliestDate = checkDate;
        break;
      }
    }

    this.selectedDate = earliestDate ? earliestDate : new Date();
    this.selectedDateControl.setValue(this.selectedDate);
  }

  isTimeAvailable(time: string): boolean {
    const timeInMinutes = this.timeToNumber(time);
    return this.availableSlots.some(slot => {
      const startInMinutes = this.timeToNumber(slot.start);
      const endInMinutes = this.timeToNumber(slot.end);
      return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes && slot.type === 'available';
    });
  }

  getAvailableSlotsForInstructor(instructor: Instructor | null, date: Date | null): Slot[] {
    if (!date || !instructor) {
      return [];
    }

    const selectedDate = this.formatDate(date);
    const selectedDay = this.getDayOfWeek(date);


    let availableSlots: Slot[] = instructor.availability[selectedDate] || [];


    if (availableSlots.length === 0) {
      availableSlots = instructor.availability[selectedDay] || [];
    }


    availableSlots.sort((a, b) => (a.start > b.start ? 1 : -1));

    return availableSlots;
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {

    if (view === 'month') {
      const availableSlots = this.getAvailableSlotsForInstructor(this.instructor, cellDate);
      return availableSlots.length > 0 && cellDate > new Date() ? 'available-date-class' : '';
    }
    return '';
  };

  isDateAvailable(date: Date): boolean {
    if (!date) {
      return false;
    }

    const availableSlots = this.getAvailableSlotsForInstructor(this.instructor, date);

    return availableSlots.length > 0;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  calculateRatingAndReviews(): void {
    if (this.instructor.reviews && this.instructor.reviews.length > 0) {
      let totalRating = 0;
      this.instructor.reviews.forEach(review => {
        totalRating += review.rating;
      });
      this.averageRating = totalRating / this.instructor.reviews.length;
      this.totalReviews = this.instructor.reviews.length;
    }
  }

}