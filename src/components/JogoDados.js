import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Dado from './Dado';

const RODADAS_TOTAIS = 5;

const CORES = {
  jogador1: '#4f8cff',
  jogador2: '#ff9f43',
  empate: '#95a5a6',
  fundo: '#12141a',
  cartao: '#1c1f28',
  borda: '#2a2f3d',
  texto: '#eef1f8',
  textoSuave: '#9aa3b5',
};

const sortearDado = () => Math.floor(Math.random() * 6) + 1;
const sortearDoisDados = () => [sortearDado(), sortearDado()];

/** Exibe o dado sorteado ou um espaço em branco enquanto o jogador não jogou. */
function DadoOuPlaceholder({ valor }) {
  if (valor == null) {
    return (
      <View style={styles.placeholder} accessibilityLabel="Dado ainda não jogado">
        <Text style={styles.textoPlaceholder}>?</Text>
      </View>
    );
  }
  return <Dado valor={valor} tamanho={64} />;
}

/** Cartão de um jogador: seus dois dados, a soma e o botão de jogar. */
function CartaoJogador({
  nome,
  cor,
  dados,
  soma,
  aoJogar,
  habilitado,
  vezDoJogador,
}) {
  return (
    <View style={[styles.cartao, { borderColor: `${cor}66` }]}>
      <View style={styles.cabecalhoJogador}>
        <Text style={[styles.nomeJogador, { color: cor }]}>{nome}</Text>
        {vezDoJogador ? (
          <Text style={[styles.seloVez, { backgroundColor: cor }]}>sua vez</Text>
        ) : null}
      </View>

      <View style={styles.linhaDados}>
        <DadoOuPlaceholder valor={dados[0]} />
        <DadoOuPlaceholder valor={dados[1]} />
        <View style={styles.caixaSoma}>
          <Text style={styles.rotuloSoma}>Soma</Text>
          <Text style={styles.valorSoma}>{soma != null ? soma : '—'}</Text>
        </View>
      </View>

      <Pressable
        onPress={aoJogar}
        disabled={!habilitado}
        accessibilityRole="button"
        accessibilityState={{ disabled: !habilitado }}
        accessibilityLabel={`Jogar dados do ${nome}`}
        style={({ pressed }) => [
          styles.botao,
          { backgroundColor: cor },
          !habilitado && styles.botaoDesabilitado,
          pressed && habilitado && styles.botaoPressionado,
        ]}
      >
        <Text style={styles.textoBotao}>Jogar Dados</Text>
      </Pressable>
    </View>
  );
}

function ItemPlacar({ rotulo, valor, cor }) {
  return (
    <View style={styles.itemPlacar}>
      <Text style={[styles.valorPlacar, { color: cor }]}>{valor}</Text>
      <Text style={styles.rotuloPlacar}>{rotulo}</Text>
    </View>
  );
}

export default function JogoDados() {
  const [rodada, setRodada] = useState(1);
  const [dadosJogador1, setDadosJogador1] = useState([null, null]);
  const [dadosJogador2, setDadosJogador2] = useState([null, null]);
  // 'jogador1' | 'jogador2' | 'rodadaEncerrada' | 'partidaEncerrada'
  const [turno, setTurno] = useState('jogador1');
  const [resultadoRodada, setResultadoRodada] = useState(null);
  const [placar, setPlacar] = useState({ jogador1: 0, jogador2: 0, empates: 0 });
  const [historico, setHistorico] = useState([]);

  const somaJogador1 =
    dadosJogador1[0] != null ? dadosJogador1[0] + dadosJogador1[1] : null;
  const somaJogador2 =
    dadosJogador2[0] != null ? dadosJogador2[0] + dadosJogador2[1] : null;

  /** Joga os dados do jogador informado; a rodada termina após o Jogador 2. */
  const jogarDados = (jogador) => {
    const turnoEsperado = jogador === 1 ? 'jogador1' : 'jogador2';
    if (turno !== turnoEsperado) return; // apenas um botão fica habilitado por vez

    const dados = sortearDoisDados();

    if (jogador === 1) {
      setDadosJogador1(dados);
      setTurno('jogador2');
      return;
    }

    // Jogador 2 jogou: compara as somas dos dois dados de cada jogador
    const soma1 = dadosJogador1[0] + dadosJogador1[1];
    const soma2 = dados[0] + dados[1];
    const vencedor = soma1 > soma2 ? 1 : soma2 > soma1 ? 2 : 0;

    setDadosJogador2(dados);
    setResultadoRodada({ rodada, soma1, soma2, vencedor });
    setHistorico((atual) => [...atual, { rodada, soma1, soma2, vencedor }]);
    setPlacar((atual) => ({
      jogador1: atual.jogador1 + (vencedor === 1 ? 1 : 0),
      jogador2: atual.jogador2 + (vencedor === 2 ? 1 : 0),
      empates: atual.empates + (vencedor === 0 ? 1 : 0),
    }));
    setTurno(rodada === RODADAS_TOTAIS ? 'partidaEncerrada' : 'rodadaEncerrada');
  };

  const proximaRodada = () => {
    if (turno !== 'rodadaEncerrada') return;
    setRodada((atual) => atual + 1);
    setDadosJogador1([null, null]);
    setDadosJogador2([null, null]);
    setResultadoRodada(null);
    setTurno('jogador1');
  };

  const jogarNovamente = () => {
    setRodada(1);
    setDadosJogador1([null, null]);
    setDadosJogador2([null, null]);
    setResultadoRodada(null);
    setPlacar({ jogador1: 0, jogador2: 0, empates: 0 });
    setHistorico([]);
    setTurno('jogador1');
  };

  const textoResultado =
    resultadoRodada == null
      ? null
      : resultadoRodada.vencedor === 1
        ? 'Jogador 1 venceu'
        : resultadoRodada.vencedor === 2
          ? 'Jogador 2 venceu'
          : 'Empate';

  const corResultado =
    resultadoRodada == null
      ? CORES.empate
      : resultadoRodada.vencedor === 1
        ? CORES.jogador1
        : resultadoRodada.vencedor === 2
          ? CORES.jogador2
          : CORES.empate;

  const vencedorPartida =
    placar.jogador1 > placar.jogador2
      ? 1
      : placar.jogador2 > placar.jogador1
        ? 2
        : 0;

  const textoPartida =
    vencedorPartida === 1
      ? 'Jogador 1 venceu a partida!'
      : vencedorPartida === 2
        ? 'Jogador 2 venceu a partida!'
        : 'Empate geral!';

  const paddingTop =
    Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 24;

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={[styles.conteudo, { paddingTop }]}
    >
      <Text style={styles.titulo}>Jogo de Dados</Text>
      <Text style={styles.subtitulo}>Jogador 1 × Jogador 2 • 5 rodadas</Text>

      <View style={styles.badgeRodada}>
        <Text style={styles.textoRodada}>
          {`Rodada ${rodada} de ${RODADAS_TOTAIS}`}
        </Text>
      </View>

      <View style={styles.placar}>
        <ItemPlacar rotulo="Jogador 1" valor={placar.jogador1} cor={CORES.jogador1} />
        <ItemPlacar rotulo="Empates" valor={placar.empates} cor={CORES.empate} />
        <ItemPlacar rotulo="Jogador 2" valor={placar.jogador2} cor={CORES.jogador2} />
      </View>

      <CartaoJogador
        nome="Jogador 1"
        cor={CORES.jogador1}
        dados={dadosJogador1}
        soma={somaJogador1}
        aoJogar={() => jogarDados(1)}
        habilitado={turno === 'jogador1'}
        vezDoJogador={turno === 'jogador1'}
      />

      <CartaoJogador
        nome="Jogador 2"
        cor={CORES.jogador2}
        dados={dadosJogador2}
        soma={somaJogador2}
        aoJogar={() => jogarDados(2)}
        habilitado={turno === 'jogador2'}
        vezDoJogador={turno === 'jogador2'}
      />

      {resultadoRodada != null && (
        <View style={[styles.banner, { borderColor: corResultado }]}>
          <Text style={[styles.bannerTitulo, { color: corResultado }]}>
            {textoResultado}
          </Text>
          <Text style={styles.bannerDetalhe}>
            {`Rodada ${resultadoRodada.rodada} — Jogador 1: ${resultadoRodada.soma1} × Jogador 2: ${resultadoRodada.soma2}`}
          </Text>
        </View>
      )}

      {turno === 'rodadaEncerrada' && (
        <Pressable
          onPress={proximaRodada}
          accessibilityRole="button"
          accessibilityLabel="Ir para a próxima rodada"
          style={({ pressed }) => [
            styles.botaoSecundario,
            pressed && styles.botaoPressionado,
          ]}
        >
          <Text style={styles.textoBotaoSecundario}>Próxima Rodada →</Text>
        </Pressable>
      )}

      {turno === 'partidaEncerrada' && (
        <View style={[styles.cartao, styles.cartaoFinal]}>
          <Text style={styles.tituloFinal}>Fim de jogo!</Text>
          <Text style={[styles.textoFinal, { color: corResultadoPartida(vencedorPartida) }]}>
            {textoPartida}
          </Text>
          <Text style={styles.placarFinal}>
            {`Placar final — Jogador 1: ${placar.jogador1} • Empates: ${placar.empates} • Jogador 2: ${placar.jogador2}`}
          </Text>
          <Pressable
            onPress={jogarNovamente}
            accessibilityRole="button"
            accessibilityLabel="Jogar novamente"
            style={({ pressed }) => [
              styles.botao,
              { backgroundColor: CORES.jogador1 },
              pressed && styles.botaoPressionado,
            ]}
          >
            <Text style={styles.textoBotao}>Jogar Novamente</Text>
          </Pressable>
        </View>
      )}

      {historico.length > 0 && (
        <View style={[styles.cartao, styles.cartaoHistorico]}>
          <Text style={styles.tituloSecao}>Resultados das rodadas</Text>
          {historico.map((item) => (
            <Text key={item.rodada} style={styles.linhaHistorico}>
              {`Rodada ${item.rodada}: ${
                item.vencedor === 1
                  ? 'Jogador 1 venceu'
                  : item.vencedor === 2
                    ? 'Jogador 2 venceu'
                    : 'Empate'
              } (${item.soma1} × ${item.soma2})`}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function corResultadoPartida(vencedor) {
  if (vencedor === 1) return CORES.jogador1;
  if (vencedor === 2) return CORES.jogador2;
  return CORES.empate;
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  titulo: {
    color: CORES.texto,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitulo: {
    color: CORES.textoSuave,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeRodada: {
    alignSelf: 'center',
    backgroundColor: '#262b38',
    borderColor: CORES.borda,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 16,
  },
  textoRodada: {
    color: CORES.texto,
    fontSize: 15,
    fontWeight: '700',
  },
  placar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: CORES.cartao,
    borderColor: CORES.borda,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  itemPlacar: {
    flex: 1,
    alignItems: 'center',
  },
  valorPlacar: {
    fontSize: 24,
    fontWeight: '800',
  },
  rotuloPlacar: {
    color: CORES.textoSuave,
    fontSize: 12,
    marginTop: 2,
  },
  cartao: {
    backgroundColor: CORES.cartao,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    padding: 16,
    marginBottom: 14,
  },
  cabecalhoJogador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nomeJogador: {
    fontSize: 18,
    fontWeight: '800',
  },
  seloVez: {
    color: '#12141a',
    fontSize: 12,
    fontWeight: '800',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  linhaDados: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: 14,
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: CORES.borda,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161923',
  },
  textoPlaceholder: {
    color: CORES.textoSuave,
    fontSize: 28,
    fontWeight: '700',
  },
  caixaSoma: {
    alignItems: 'center',
    backgroundColor: '#161923',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.borda,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 64,
  },
  rotuloSoma: {
    color: CORES.textoSuave,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valorSoma: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: '800',
  },
  botao: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.35,
  },
  botaoPressionado: {
    opacity: 0.75,
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  botaoSecundario: {
    backgroundColor: '#262b38',
    borderColor: CORES.borda,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  textoBotaoSecundario: {
    color: CORES.texto,
    fontSize: 16,
    fontWeight: '800',
  },
  banner: {
    backgroundColor: '#161923',
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  bannerTitulo: {
    fontSize: 20,
    fontWeight: '800',
  },
  bannerDetalhe: {
    color: CORES.textoSuave,
    fontSize: 13,
    marginTop: 4,
  },
  cartaoFinal: {
    alignItems: 'center',
    borderColor: '#3a4154',
  },
  tituloFinal: {
    color: CORES.texto,
    fontSize: 22,
    fontWeight: '800',
  },
  textoFinal: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  placarFinal: {
    color: CORES.textoSuave,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 14,
    textAlign: 'center',
  },
  cartaoHistorico: {
    borderColor: CORES.borda,
  },
  tituloSecao: {
    color: CORES.texto,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  linhaHistorico: {
    color: CORES.textoSuave,
    fontSize: 13,
    lineHeight: 22,
  },
});
