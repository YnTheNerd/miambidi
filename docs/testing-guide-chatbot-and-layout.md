# 🧪 Testing Guide: Chatbot & Recipe Card Layout

## 🤖 **CHATBOT TESTING SCENARIOS**

### **1. System Knowledge & Navigation Help**

#### **Test Pantry Integration:**
```
Test Queries:
• "Combien d'ingrédients dans mon garde-manger ?"
• "Quels ingrédients expirent bientôt ?"
• "Montre-moi mes ingrédients récents"
• "Comment ajouter un ingrédient ?"

Expected Results:
✅ Real-time pantry counts and statistics
✅ Specific ingredient names and expiration info
✅ Step-by-step guidance for app features
```

#### **Test Recipe Integration:**
```
Test Queries:
• "Combien de recettes j'ai ?"
• "Quelles sont mes recettes favorites ?"
• "Comment créer une nouvelle recette ?"
• "Recommande-moi une recette avec mes ingrédients"

Expected Results:
✅ Accurate recipe counts and statistics
✅ Personalized recommendations based on pantry
✅ Navigation guidance for recipe creation
```

#### **Test Family Context:**
```
Test Queries:
• "Qui sont les membres de ma famille ?"
• "Comment planifier les repas familiaux ?"
• "Conseils pour cuisiner en famille"

Expected Results:
✅ Family member information
✅ Meal planning suggestions based on family size
✅ Contextual cooking advice
```

### **2. AI-Powered Cooking Assistant**

#### **Test Cameroonian Cuisine Expertise:**
```
Test Queries:
• "Comment faire du ndolé ?"
• "Conseils pour cuisiner le poisson fumé"
• "Recettes traditionnelles camerounaises"
• "Ingrédients typiques du Cameroun"

Expected Results:
✅ Authentic Cameroonian cooking techniques
✅ Traditional ingredient recommendations
✅ Cultural context and cooking tips
```

#### **Test Ingredient Substitutions:**
```
Test Queries:
• "Par quoi remplacer le lait de coco ?"
• "Alternative au poisson fumé"
• "Substituts d'ingrédients camerounais"

Expected Results:
✅ Practical substitution suggestions
✅ Local alternatives when possible
✅ Cooking technique adjustments
```

### **3. Multilingual & Cultural Features**

#### **Test French Language Quality:**
```
Test Queries:
• Mix French and English in same conversation
• Use cooking terminology in both languages
• Test Cameroonian expressions understanding

Expected Results:
✅ Consistent French responses
✅ Natural Cameroonian expressions
✅ Proper cooking terminology usage
```

### **4. Error Handling & Fallback System**

#### **Test Humorous Fallback Patterns:**
```
Test Queries (Nonsensical):
• "Combien de licornes dans ma cuisine ?"
• "Comment voler jusqu'à la lune ?"
• "Recette pour transformer l'eau en vin"
• "Pourquoi les bananes sont-elles jaunes ?"
• "Comment parler aux extraterrestres ?"

Expected Fallback Rotation:
✅ 2/5 times: Samuel Eto'o references
✅ 2/5 times: AI/robot humor  
✅ 1/5 times: Daily life observations
✅ Maximum 4 sentences with emojis
✅ Constructive redirect included
```

### **5. UI/UX Testing**

#### **Test Chat Interface:**
```
Visual Tests:
• Click floating chat button (bottom-right, green)
• Verify slide-out panel (400px desktop, full mobile)
• Check user/AI avatars and message attribution
• Test auto-scroll behavior
• Verify typing indicator with animated dots

Expected Results:
✅ Smooth slide-in/out animations (300ms)
✅ Proper message bubbles and avatars
✅ Auto-scroll to latest messages
✅ Typing indicator shows for minimum 1.5s
```

#### **Test Interactive Elements:**
```
Interaction Tests:
• Test minimize/maximize panel
• Try quick action buttons
• Test clear conversation
• Use "Aide" button
• Test input field and send button

Expected Results:
✅ All buttons respond correctly
✅ Quick actions auto-submit
✅ Conversation clears properly
✅ Input validation works
```

### **6. Context-Aware Quick Actions**

#### **Test Route-Specific Suggestions:**
```
Navigation Tests:
• Go to /pantry - Check quick actions
• Go to /recipes - Check quick actions  
• Go to /family - Check quick actions
• Go to /shopping-list - Check quick actions
• Go to /meal-planning - Check quick actions

Expected Quick Actions:
✅ /pantry: "Quels ingrédients expirent bientôt ?"
✅ /recipes: "Suggère-moi une recette camerounaise"
✅ /family: "Comment planifier les repas familiaux ?"
✅ Each route shows relevant suggestions
```

---

## 📱 **RECIPE CARD LAYOUT TESTING**

### **1. Dimension Standards Testing**

#### **Test Fixed Height:**
```
Visual Tests:
• Navigate to /recipes page
• Verify all cards are exactly 320px height
• Test with recipes having different content lengths
• Check alignment in grid

Expected Results:
✅ All cards maintain 320px height
✅ Grid alignment is perfect
✅ No content overflow issues
```

#### **Test Width Constraints:**
```
Responsive Tests:
• Resize browser from 1400px to 280px width
• Check card width behavior at each breakpoint
• Verify minimum 280px, maximum 400px constraints

Expected Results:
✅ Cards never go below 280px width
✅ Cards never exceed 400px width
✅ Optimal 340px width when space allows
```

### **2. Responsive Grid Behavior**

#### **Test Breakpoint Behavior:**
```
Screen Size Tests:
• Desktop (≥1200px): Should show 3-4 cards per row, 16px gaps
• Tablet (768px-1199px): Should show 2-3 cards per row, 12px gaps
• Mobile (≤767px): Should show 1-2 cards per row, 8px gaps

Expected Results:
✅ Correct number of cards per row at each breakpoint
✅ Appropriate gap sizes
✅ Balanced distribution with space-evenly
```

### **3. Content Adaptation Testing**

#### **Test Content Elements:**
```
Content Tests:
• Recipe image: Should be 180px height, cover entire width
• Recipe title: Should truncate after 2 lines, 16px font
• Metadata: Should fit on single line, 14px font
• Description: Should truncate after 3 lines, 12px font
• Action buttons: Should be 52px height, responsive width

Expected Results:
✅ All content elements fit within constraints
✅ Text truncation works properly
✅ Images scale correctly with object-fit: cover
✅ Buttons maintain consistent height
```

### **4. Visual Effects Testing**

#### **Test Hover Effects:**
```
Interaction Tests:
• Hover over recipe cards
• Check transform and shadow effects
• Verify smooth transitions

Expected Results:
✅ Cards lift up 4px on hover
✅ Box shadow increases smoothly
✅ Transition duration is appropriate
```

---

## 🔧 **TECHNICAL TESTING**

### **1. Error Boundary Testing**

#### **Test Chatbot Error Handling:**
```
Error Tests:
• Disconnect internet during chat
• Send extremely long messages
• Rapid-fire multiple messages
• Test with invalid API responses

Expected Results:
✅ Graceful error messages
✅ Humorous fallback responses
✅ No app crashes
✅ Error boundary catches issues
```

### **2. Performance Testing**

#### **Test Chatbot Performance:**
```
Performance Tests:
• Send 20+ messages in conversation
• Test conversation history limit (10 messages)
• Check memory usage during long chats
• Test typing indicator timing

Expected Results:
✅ Conversation history stays at 10 messages max
✅ No memory leaks
✅ Typing indicator shows for realistic duration
✅ Smooth animations throughout
```

#### **Test Recipe Grid Performance:**
```
Performance Tests:
• Load page with 50+ recipes
• Resize window rapidly
• Scroll through recipe grid
• Test on mobile devices

Expected Results:
✅ Grid layout calculates efficiently
✅ No layout thrashing during resize
✅ Smooth scrolling performance
✅ Mobile performance is acceptable
```

---

## 📋 **TESTING CHECKLIST**

### **Chatbot Features:**
- [ ] Real-time pantry data access
- [ ] Recipe recommendations work
- [ ] Family context integration
- [ ] Cameroonian cuisine expertise
- [ ] Humorous fallback rotation (2/5, 2/5, 1/5 pattern)
- [ ] French language consistency
- [ ] Quick actions by route
- [ ] Typing indicators and animations
- [ ] Error boundaries prevent crashes
- [ ] Mobile responsiveness

### **Recipe Card Layout:**
- [ ] Fixed 320px height maintained
- [ ] Width constraints (280px-400px) work
- [ ] Responsive grid behavior correct
- [ ] Content adaptation proper
- [ ] Image sizing (180px height) correct
- [ ] Text truncation working
- [ ] Action buttons (52px height) consistent
- [ ] Hover effects smooth
- [ ] Mobile layout optimized
- [ ] Performance acceptable

### **Integration Testing:**
- [ ] Chatbot works on all app pages
- [ ] Recipe cards display correctly in all contexts
- [ ] No conflicts with existing features
- [ ] Error handling doesn't break other components
- [ ] Performance impact is minimal

---

## 🎯 **SUCCESS CRITERIA**

### **Chatbot Success:**
✅ Responds intelligently to 95%+ of cooking-related queries
✅ Provides accurate real-time data from app contexts
✅ Maintains cultural authenticity in responses
✅ Fallback humor follows exact rotation pattern
✅ UI animations are smooth and professional

### **Recipe Layout Success:**
✅ All cards maintain consistent 320px height
✅ Grid adapts properly to all screen sizes
✅ Content fits within constraints without overflow
✅ Visual hierarchy is clear and appealing
✅ Performance remains smooth with many cards

**🎉 Both features should pass all tests for production readiness!**
