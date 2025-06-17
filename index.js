require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const keepAlive = require("./keep_alive");
const { execFile } = require("child_process");
const fs = require("fs");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnStop: false,
  plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YtDlpPlugin()]
});

// ✅ ضع هنا ID الروم الذي تريد إرسال الصور إليه
const targetChannelId = "1324073373440938140"; // ← استبدله بـ ID الروم المطلوب

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
    case "!cover":
      if (args.length < 2) return message.channel.send("❌ استخدم: !cover [اسم الأغنية] [رابط الغلاف]");
      const song = args[0];
      const cover = args[1];
      const script = "python/generate_image.py";

      execFile("python3", [script, song, cover], (err, stdout) => {
        if (err) return message.channel.send("❌ خطأ في توليد الصورة.");
        const img = stdout.trim();
        if (fs.existsSync(img)) {
          const channel = client.channels.cache.get(targetChannelId);
          if (!channel) return message.channel.send("⚠️ لم يتم العثور على الروم الهدف.");
          channel.send({ content: `🎵 ${song}`, files: [img] });
        } else {
          message.channel.send("❌ تعذر العثور على الصورة الناتجة.");
        }
      });
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
!vol [1-100] – تحكم بالصوت  
!cover [اسم] [رابط غلاف] – توليد صورة مشغل الأغنية`);
      break;
  }
});

keepAlive();
client.login(process.env.TOKEN);
