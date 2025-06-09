/**
 * Family Management Test Suite for MiamBidi
 * Comprehensive testing of Firestore family functionality
 */

import { 
  doc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  where,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Test suite for family management functionality
 */
export class FamilyTestSuite {
  constructor(familyContext, authContext) {
    this.familyContext = familyContext;
    this.authContext = authContext;
    this.testResults = [];
    this.createdTestData = [];
  }

  /**
   * Add test result
   */
  addResult(testName, success, message, data = null) {
    const result = {
      testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${success ? '✅' : '❌'} ${testName}: ${message}`);
    return result;
  }

  /**
   * Test 1: Family Creation
   */
  async testFamilyCreation() {
    try {
      const testFamilyName = `Test Family ${Date.now()}`;
      const family = await this.familyContext.createFamily(testFamilyName);
      
      if (family && family.name === testFamilyName) {
        this.createdTestData.push({ type: 'family', id: family.id });
        return this.addResult(
          'Family Creation',
          true,
          `Family "${testFamilyName}" created successfully`,
          family
        );
      } else {
        return this.addResult(
          'Family Creation',
          false,
          'Family creation returned invalid data'
        );
      }
    } catch (error) {
      return this.addResult(
        'Family Creation',
        false,
        `Family creation failed: ${error.message}`
      );
    }
  }

  /**
   * Test 2: Family Data Persistence
   */
  async testFamilyPersistence() {
    try {
      const { family } = this.familyContext;
      if (!family) {
        return this.addResult(
          'Family Persistence',
          false,
          'No family found to test persistence'
        );
      }

      // Fetch family directly from Firestore
      const familyDoc = await getDoc(doc(db, 'families', family.id));
      
      if (familyDoc.exists()) {
        const firestoreData = familyDoc.data();
        const isDataConsistent = firestoreData.name === family.name;
        
        return this.addResult(
          'Family Persistence',
          isDataConsistent,
          isDataConsistent 
            ? 'Family data persisted correctly in Firestore'
            : 'Family data inconsistent between context and Firestore'
        );
      } else {
        return this.addResult(
          'Family Persistence',
          false,
          'Family document not found in Firestore'
        );
      }
    } catch (error) {
      return this.addResult(
        'Family Persistence',
        false,
        `Persistence test failed: ${error.message}`
      );
    }
  }

  /**
   * Test 3: Member Addition
   */
  async testMemberAddition() {
    try {
      const { family } = this.familyContext;
      if (!family) {
        return this.addResult(
          'Member Addition',
          false,
          'No family found to test member addition'
        );
      }

      const testMember = {
        displayName: `Test Member ${Date.now()}`,
        email: `test.member.${Date.now()}@example.com`,
        age: 25,
        dietaryRestrictions: ['vegetarian'],
        allergies: ['nuts'],
        favoriteCategories: ['italian'],
        dislikedFoods: ['mushrooms']
      };

      const member = await this.familyContext.addFamilyMember(testMember);
      
      if (member && member.displayName === testMember.displayName) {
        this.createdTestData.push({ type: 'member', id: member.uid, familyId: family.id });
        return this.addResult(
          'Member Addition',
          true,
          `Member "${testMember.displayName}" added successfully`,
          member
        );
      } else {
        return this.addResult(
          'Member Addition',
          false,
          'Member addition returned invalid data'
        );
      }
    } catch (error) {
      return this.addResult(
        'Member Addition',
        false,
        `Member addition failed: ${error.message}`
      );
    }
  }

  /**
   * Test 4: Real-time Updates
   */
  async testRealTimeUpdates() {
    try {
      const { family, familyMembers } = this.familyContext;
      if (!family) {
        return this.addResult(
          'Real-time Updates',
          false,
          'No family found to test real-time updates'
        );
      }

      const initialMemberCount = familyMembers.length;
      
      // Add a member and check if context updates
      const testMember = {
        displayName: `RT Test Member ${Date.now()}`,
        email: `rt.test.${Date.now()}@example.com`,
        age: 30
      };

      await this.familyContext.addFamilyMember(testMember);
      
      // Wait a moment for real-time update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedMemberCount = this.familyContext.familyMembers.length;
      const hasUpdated = updatedMemberCount > initialMemberCount;
      
      return this.addResult(
        'Real-time Updates',
        hasUpdated,
        hasUpdated 
          ? `Member count updated from ${initialMemberCount} to ${updatedMemberCount}`
          : 'Real-time updates not working'
      );
    } catch (error) {
      return this.addResult(
        'Real-time Updates',
        false,
        `Real-time update test failed: ${error.message}`
      );
    }
  }

  /**
   * Test 5: Security Rules Validation
   */
  async testSecurityRules() {
    try {
      const { currentUser } = this.authContext;
      if (!currentUser) {
        return this.addResult(
          'Security Rules',
          false,
          'No authenticated user to test security rules'
        );
      }

      // Try to access a non-existent family (should fail)
      try {
        const nonExistentFamilyDoc = await getDoc(doc(db, 'families', 'non-existent-family'));
        
        return this.addResult(
          'Security Rules',
          !nonExistentFamilyDoc.exists(),
          nonExistentFamilyDoc.exists() 
            ? 'Security rules may be too permissive'
            : 'Security rules properly restrict access to non-existent families'
        );
      } catch (securityError) {
        return this.addResult(
          'Security Rules',
          true,
          'Security rules properly blocked unauthorized access'
        );
      }
    } catch (error) {
      return this.addResult(
        'Security Rules',
        false,
        `Security rules test failed: ${error.message}`
      );
    }
  }

  /**
   * Test 6: Family Settings Update
   */
  async testFamilySettingsUpdate() {
    try {
      const { family } = this.familyContext;
      if (!family) {
        return this.addResult(
          'Family Settings Update',
          false,
          'No family found to test settings update'
        );
      }

      const newSettings = {
        weekStartsOn: 'Dimanche',
        allowMemberInvites: false
      };

      await this.familyContext.updateFamilySettings(newSettings);
      
      // Wait for update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedFamily = this.familyContext.family;
      const settingsUpdated = updatedFamily.settings.weekStartsOn === 'Dimanche';
      
      return this.addResult(
        'Family Settings Update',
        settingsUpdated,
        settingsUpdated 
          ? 'Family settings updated successfully'
          : 'Family settings update failed'
      );
    } catch (error) {
      return this.addResult(
        'Family Settings Update',
        false,
        `Settings update test failed: ${error.message}`
      );
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Family Management Test Suite...');
    
    this.testResults = [];
    
    await this.testFamilyCreation();
    await this.testFamilyPersistence();
    await this.testMemberAddition();
    await this.testRealTimeUpdates();
    await this.testSecurityRules();
    await this.testFamilySettingsUpdate();
    
    const successCount = this.testResults.filter(r => r.success).length;
    const totalTests = this.testResults.length;
    
    console.log(`\n📊 Test Results: ${successCount}/${totalTests} tests passed`);
    
    return {
      results: this.testResults,
      summary: {
        total: totalTests,
        passed: successCount,
        failed: totalTests - successCount,
        passRate: (successCount / totalTests) * 100
      }
    };
  }

  /**
   * Clean up test data
   */
  async cleanupTestData() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      const batch = writeBatch(db);
      
      for (const testData of this.createdTestData) {
        if (testData.type === 'family') {
          batch.delete(doc(db, 'families', testData.id));
        } else if (testData.type === 'member') {
          batch.delete(doc(db, 'families', testData.familyId, 'members', testData.id));
        }
      }
      
      await batch.commit();
      this.createdTestData = [];
      
      console.log('✅ Test data cleaned up successfully');
    } catch (error) {
      console.error('❌ Error cleaning up test data:', error);
    }
  }
}

export default FamilyTestSuite;
