import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar, Platform } from 'react-native';
import { AuthContext } from '../AuthContext';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import logo from '../../assets/logo.png';

function WelcomeBox({ onLogin }) {
  return (
    <View style={styles.welcomeBox}>
      <Image source={logo} style={styles.welcomeAvatar} />
      <Text style={styles.welcomeTitle}>Welcome to Alurà!</Text>
      <Text style={styles.welcomeDesc}>
        Log in to access your personal details, order history, prescriptions, and exclusive offers.
      </Text>
      <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
        <Text style={styles.loginText}>Log In or Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

function WhyLogin() {
  return (
    <View style={styles.whyBox}>
      <Text style={styles.sectionTitle}>Why Log In?</Text>
      <View style={styles.whyItem}>
        <Ionicons name="cube-outline" size={22} color="#6C63FF" style={styles.whyIcon} />
        <View>
          <Text style={styles.whyTitle}>View Order History</Text>
          <Text style={styles.whyDesc}>Track your past purchases and reorder easily.</Text>
          <Text style={styles.whyLock}>Log In to Access</Text>
        </View>
      </View>
      <View style={styles.whyItem}>
        <Ionicons name="medkit-outline" size={22} color="#6C63FF" style={styles.whyIcon} />
        <View>
          <Text style={styles.whyTitle}>Manage Prescriptions</Text>
          <Text style={styles.whyDesc}>Request refills and view your active prescriptions securely.</Text>
          <Text style={styles.whyLock}>Log In to Access</Text>
        </View>
      </View>
      <View style={styles.whyItem}>
        <FontAwesome name="star-o" size={22} color="#6C63FF" style={styles.whyIcon} />
        <View>
          <Text style={styles.whyTitle}>Exclusive Offers & Rewards</Text>
          <Text style={styles.whyDesc}>Unlock personalized discounts and loyalty rewards.</Text>
          <Text style={styles.whyLock}>Log In to Access</Text>
        </View>
      </View>
    </View>
  );
}

function UserInfo({ user, onLogout }) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoHeader}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color="#6C63FF" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.phone}>{user.phone || '0123456789'}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={onLogout}>
        <Text style={styles.loginText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function PurchaseHistory() {
  return (
    <View style={styles.purchaseBox}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="time-outline" size={24} color="#6C63FF" style={{ marginRight: 12 }} />
        <View>
          <Text style={styles.purchaseTitle}>Purchase History</Text>
          <Text style={styles.purchaseSub}>Last purchase: May 30, 2025</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#bbb" />
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { isLoggedIn, logout, user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your Profile</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="#222" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      {/* Nội dung */}
      <View style={styles.content}>
        {!isLoggedIn ? (
          <>
            <WelcomeBox onLogin={() => navigation.navigate('Login')} />
            <WhyLogin />
          </>
        ) : (
          <>
            <UserInfo user={user} onLogout={() => {
              logout();
              navigation.navigate('Login');
            }} />
            <Text style={styles.sectionTitle}>Purchase History</Text>
            <PurchaseHistory />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    padding: 18,
  },
  welcomeBox: {
    backgroundColor: '#F2F7FD',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
    textAlign: 'center',
  },
  welcomeDesc: {
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  whyBox: {
    marginBottom: 24,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  whyIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  whyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  whyDesc: {
    color: '#888',
    fontSize: 14,
  },
  whyLock: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#EAE8F9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  editText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  phone: {
    fontSize: 15,
    color: '#888',
    alignSelf: 'flex-start',
  },
  email: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  purchaseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  purchaseTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  purchaseSub: {
    color: '#888',
    fontSize: 13,
  },
}); 