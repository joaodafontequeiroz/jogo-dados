import React from 'react';
import { Image, StyleSheet } from 'react-native';

// Imagens dos dados salvas dentro do próprio projeto
const IMAGENS_DADOS = {
  1: require('../../assets/dados/dado1.png'),
  2: require('../../assets/dados/dado2.png'),
  3: require('../../assets/dados/dado3.png'),
  4: require('../../assets/dados/dado4.png'),
  5: require('../../assets/dados/dado5.png'),
  6: require('../../assets/dados/dado6.png'),
};

/**
 * Dado - exibe a imagem correspondente ao valor sorteado.
 * @param {object} props
 * @param {number} props.valor - número entre 1 e 6
 * @param {number} [props.tamanho] - lado do dado em dp (padrão 72)
 */
export default function Dado({ valor, tamanho = 72 }) {
  const imagem = IMAGENS_DADOS[valor] ?? IMAGENS_DADOS[1];

  return (
    <Image
      source={imagem}
      style={[styles.dado, { width: tamanho, height: tamanho }]}
      resizeMode="contain"
      accessibilityLabel={`Dado com o valor ${valor}`}
    />
  );
}

const styles = StyleSheet.create({
  dado: {
    backgroundColor: 'transparent',
  },
});
