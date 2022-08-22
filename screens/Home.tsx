import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

import { useWalletConnect } from '@walletconnect/react-native-dapp';

const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(
    address.length - 4,
    address.length
  )}`;
}

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {

  const [address, setAddress] = useState(0);
  const [nfts, setNfts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const connector = useWalletConnect();

  useEffect(() => {
    // connector.connect();
    if (connector.connected) {
      getNftsFromAlchemy();
    }
  }, [connector])

  const connectWallet = async () => {
    await connector.connect();
    if (connector.connected) {
      getNftsFromAlchemy();
    }
  }

  const killSession = React.useCallback(() => {
    return connector.killSession();
  }, [connector]);

  const getNftsFromAlchemy = () => {
    const baseURL = "https://eth-mainnet.g.alchemy.com/v2/tw-QKTXgWERaSNQNs5yX5qmtkb_33BtB";
    const url = `${baseURL}/getNFTs/?owner=vijayankith.eth`  // ${connector.accounts[address]}`;
    if (connector.connected) {
      return fetch(url, {
        method: 'get',
        redirect: 'follow'
      })
        .then((response) => response.json())
        .then((json) => {
          console.log(json.totalCount);
          if(json.totalCount > 0){
            for (var i = 0; i < json.ownedNfts.length; i++) {
              
              if (json.ownedNfts[i].metadata.image != undefined && json.ownedNfts[i].metadata.image.includes('ipfs://')) {
                json.ownedNfts[i].metadata.image = json.ownedNfts[i].metadata.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
                // console.log(json.ownedNfts[i].metadata.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'));
                // console.log(json.ownedNfts[i].metadata.image);
              } else if (json.ownedNfts[i].metadata.image == undefined){
                json.ownedNfts.slice(0,i);
              }else{
                json.ownedNfts[i].metadata.image = json.ownedNfts[i].metadata.image;
                console.log(json.ownedNfts[i].metadata.image);
              }
            }
            setNfts(json.ownedNfts);
          }
          setTotalCount(json.totalCount)
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };



  return (

    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My NFT's</Text>
      {!connector.connected && (
        <TouchableOpacity onPress={connectWallet} style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>Connect a Wallet</Text>
        </TouchableOpacity>
      )}
      {!!connector.connected && (
        <View style={styles.rowContainer}>
          <Text>{shortenAddress(connector.accounts[address])}</Text>
          <TouchableOpacity onPress={killSession} style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>Log out</Text>
          </TouchableOpacity>
        </View>
      )}
      {(totalCount > 0) && (
        <ScrollView>
          <View style={styles.nftViewContainer}>
          {nfts.map((data) => {
            return (
              <Image
                key={data.id.tokenId}
                style={styles.nftViewImage}
                source={{ uri: data.metadata.image }}
              />
            )
          })}
          </View>
        </ScrollView>
      )}

     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  rowContainer: {
    flexDirection: 'row',
    flexWrap: "wrap",
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nftViewContainer: {
    flexDirection: 'row',
    flexWrap : 'wrap'
  },
  nftViewImage: {
    height: 150, width: '50%',
    borderWidth :1,
    borderColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  buttonStyle: {
    backgroundColor: "red",
    borderWidth: 0,
    color: "#FFFFFF",
    borderColor: "red",
    height: 35,
    alignItems: "center",
    borderRadius: 20,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTextStyle: {
    color: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 10,
    fontWeight: "600",
  },
});
