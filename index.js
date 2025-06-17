require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const keepAlive = require("./keep_alive");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnStop: false,
  plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YtDlpPlugin()]
});

client.on("ready", () => {
  console.log(`✅ البوت جاهز ✅ - Logged in as ${client.user.tag}`);
});
client.on("messageCreate", async message => {
  if (!message.guild || message.author.bot) return;
  const args = message.content.split(" ");
  const cmd = args.shift().toLowerCase();
  switch (cmd) {
    case "!p":
      distube.play(message.member.voice.channel, args.join(" "), { textChannel: message.channel, member: message.member });
      break;
    case "!s":
    case "!n":
      distube.skip(message);
      break;
    case "!st":
      distube.stop(message);
      message.channel.send("⏹️ تم الإيقاف");
      break;
    case "!pin":
      distube.setRepeatMode(message, 1);
      message.channel.send("🔁 التكرار: تشغيل مستمر");
      break;
    case "!pause":
      distube.pause(message);
      message.channel.send("⏸️ توقف مؤقت");
      break;
    case "!resume":
      distube.resume(message);
      message.channel.send("▶️ استئناف التشغيل");
      break;
    case "!queue":
      const queue = distube.getQueue(message);
      if (!queue) return message.channel.send("❌ لا توجد أغاني في القائمة");
      message.channel.send("🎵 قائمة الأغاني:\n" + queue.songs.map((s,i)=>`${i+1}. ${s.name}`).join("\n"));
      break;
    case "!np":
      const now = distube.getQueue(message)?.songs[0];
      if (!now) return message.channel.send("❌ لا يوجد شيء الآن");
      message.channel.send(`🎶 الآن يتم تشغيل: **${now.name}**`);
      break;
    case "!vol":
      const vol = parseInt(args[0]);
      if (!vol || vol<1||vol>100) return message.channel.send("🔊 الصوت بين 1 و 100");
      distube.setVolume(message, vol);
      message.channel.send(`🔊 تم ضبط الصوت لـ ${vol}%`);
      break;
    case "!help":
      message.channel.send(`الأوامر المتاحة:
!p [رابط/كلمة] – تشغيل  
!s – تخطي  
!st – إيقاف  
!n – التالي  
!pin – تكرار  
!pause – إيقاف مؤقت  
!resume – استئناف  
!queue – عرض القائمة  
!np – الأغنية الحالية  
!vol [1-100] – تحكم بالصوت`);
      break;
  }
});

keepAlive();
client.login(process.env.TOKEN);
